const Scheme = require('../models/Scheme');
const User = require('../models/User');
const { extractDemographicsFromText, generateSchemeExplanation } = require('../utils/aiHelper');

/**
 * Deterministic Rules Engine for Scheme Eligibility (SIH26092 Section 4.3).
 * Evaluates extracted user demographics against MongoDB scheme criteria using strict logic.
 * 
 * @param {Object} profile - Extracted user demographic profile
 * @returns {Promise<Array>} List of eligible schemes with audit reasoning
 */
const matchSchemes = async (profile) => {
  // Fetch all schemes from MongoDB
  const allSchemes = await Scheme.find({});

  const matchedSchemes = [];

  for (const scheme of allSchemes) {
    const criteria = scheme.eligibility_criteria || {};
    const auditLog = [];
    let isEligible = true;

    // 1. Annual Income Audit
    if (criteria.max_income !== undefined && criteria.max_income !== null) {
      if (profile.annual_income !== null && profile.annual_income !== undefined) {
        if (profile.annual_income <= criteria.max_income) {
          auditLog.push(
            `Income compliant: User income (₹${profile.annual_income.toLocaleString('en-IN')}) is within scheme limit (₹${criteria.max_income.toLocaleString('en-IN')}).`
          );
        } else {
          isEligible = false;
        }
      } else {
        // If income is unspecified in user prompt, treat as potential match or pass with note
        auditLog.push(`Income check pending: Scheme max limit is ₹${criteria.max_income.toLocaleString('en-IN')}.`);
      }
    } else {
      auditLog.push('No upper income cap required for this scheme.');
    }

    if (!isEligible) continue;

    // 2. Target Category Audit
    if (criteria.target_category && criteria.target_category.length > 0) {
      const normalizedTargets = criteria.target_category.map((c) => c.toUpperCase().trim());
      const hasWildcard = normalizedTargets.includes('ALL') || normalizedTargets.includes('ANY') || normalizedTargets.includes('GENERAL');

      if (profile.category) {
        const userCat = profile.category.toUpperCase().trim();
        const matchesCategory = normalizedTargets.includes(userCat) || hasWildcard;

        if (matchesCategory) {
          auditLog.push(`Category match: Target categories [${criteria.target_category.join(', ')}] match user category (${profile.category}).`);
        } else {
          isEligible = false;
        }
      } else if (!hasWildcard) {
        // Category required but user hasn't specified
        auditLog.push(`Category verification pending: Requires one of [${criteria.target_category.join(', ')}].`);
      }
    } else {
      auditLog.push('Open to all beneficiary social categories.');
    }

    if (!isEligible) continue;

    // 3. Minimum Age Audit
    if (criteria.min_age !== undefined && criteria.min_age !== null) {
      if (profile.age !== null && profile.age !== undefined) {
        if (profile.age >= criteria.min_age) {
          auditLog.push(`Age compliant: User age (${profile.age}) meets minimum age requirement (${criteria.min_age}+).`);
        } else {
          isEligible = false;
        }
      } else {
        auditLog.push(`Age check pending: Minimum age requirement is ${criteria.min_age} years.`);
      }
    }

    if (isEligible) {
      matchedSchemes.push({
        _id: scheme._id,
        name: scheme.name,
        issuing_authority: scheme.issuing_authority,
        description: scheme.description,
        required_documents: scheme.required_documents,
        eligibility_criteria: scheme.eligibility_criteria,
        eligibility_audit: auditLog,
      });
    }
  }

  return matchedSchemes;
};

/**
 * @desc    Extract demographics using AI and run deterministic scheme matching
 * @route   POST /api/schemes/analyze
 * @access  Private (JWT Protected)
 */
const analyzeProfile = async (req, res, next) => {
  try {
    const rawText = req.body.text || req.body.raw_text || req.body.prompt;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide natural language text in the request body (e.g., { "text": "..." })',
      });
    }

    // 1. NLP Demographic Extraction & PII Sanitization via Gemini SDK
    const extractedDemographics = await extractDemographicsFromText(rawText);

    // 2. Persist extracted demographics to the authenticated User profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          demographics: {
            age: extractedDemographics.age,
            gender: extractedDemographics.gender,
            category: extractedDemographics.category,
            annual_income: extractedDemographics.annual_income,
            city: extractedDemographics.city,
          },
        },
      },
      { new: true, runValidators: true }
    ).select('-hashed_password');

    // 3. Deterministic Matching Engine
    const eligibleSchemes = await matchSchemes(extractedDemographics);

    // 4. Grounded RAG Explanation & Document Checklist (Phase 4)
    const explanation = await generateSchemeExplanation(extractedDemographics, eligibleSchemes);

    res.status(200).json({
      success: true,
      message: 'Demographics extracted, schemes matched, and explanation generated successfully',
      extracted_profile: extractedDemographics,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        demographics: updatedUser.demographics,
      },
      matched_count: eligibleSchemes.length,
      schemes: eligibleSchemes,
      ai_explanation: explanation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Seed initial government welfare schemes (MoSJE, NSFDC, NBCFDC, NSKFDC)
 * @route   POST /api/schemes/seed
 * @access  Public / Admin
 */
const seedSampleSchemes = async (req, res, next) => {
  try {
    const defaultSchemes = [
      {
        name: 'NSFDC Term Loan Scheme for SC Entrepreneurs',
        issuing_authority: 'National Scheduled Castes Finance and Development Corporation (NSFDC)',
        description: 'Concessional credit scheme for Scheduled Caste (SC) individuals to initiate self-employment and micro-business projects with subsidized interest rates.',
        required_documents: ['Aadhaar Card', 'Caste Certificate (SC)', 'Income Certificate', 'Project Proposal', 'Bank Passbook'],
        eligibility_criteria: {
          max_income: 300000,
          target_category: ['SC'],
          min_age: 18,
        },
      },
      {
        name: 'New Swarnima Scheme for Women Entrepreneurs',
        issuing_authority: 'National Backward Classes Finance & Development Corporation (NBCFDC)',
        description: 'Special financial assistance loan scheme designed specifically to empower women entrepreneurs from Backward Classes to obtain self-reliance.',
        required_documents: ['Aadhaar Card', 'OBC Caste Certificate', 'Income Certificate', 'Passport Photograph', 'Proof of Residence'],
        eligibility_criteria: {
          max_income: 300000,
          target_category: ['OBC'],
          min_age: 18,
        },
      },
      {
        name: 'Sanitation Workers Microfinance Scheme',
        issuing_authority: 'National Safai Karamcharis Finance & Development Corporation (NSKFDC)',
        description: 'Micro-credit facility enabling Safai Karamcharis, manual scavengers, and their dependents to establish alternative viable micro-enterprises.',
        required_documents: ['Aadhaar Card', 'Occupation Certificate / Safai Karamchari ID', 'Bank Account Details'],
        eligibility_criteria: {
          max_income: null, // No upper income limit
          target_category: ['SAFAI KARAMCHARI', 'SC'],
          min_age: 18,
        },
      },
      {
        name: 'DNT Livelihood Support Scheme (SEED)',
        issuing_authority: 'Ministry of Social Justice and Empowerment (MoSJE)',
        description: 'Concessional financial assistance to De-Notified, Nomadic and Semi-Nomadic Tribes for small businesses, animal husbandry, and vocational work.',
        required_documents: ['Aadhaar Card', 'DNT Certificate / Community Proof', 'Income Certificate', 'Bank Passbook'],
        eligibility_criteria: {
          max_income: 250000,
          target_category: ['DNT', 'ST'],
          min_age: 18,
        },
      },
      {
        name: 'PM-DAKSH Skill Development & Micro Enterprise Loan',
        issuing_authority: 'Ministry of Social Justice and Empowerment (MoSJE)',
        description: 'Skill development training followed by concessional microfinance for SC, OBC, EBC, DNT, and Sanitation Workers to launch entrepreneurial ventures.',
        required_documents: ['Aadhaar Card', 'Category Certificate', 'Income Certificate', 'Educational/Skill Certificate'],
        eligibility_criteria: {
          max_income: 300000,
          target_category: ['SC', 'OBC', 'DNT', 'SAFAI KARAMCHARI'],
          min_age: 18,
        },
      },
    ];

    for (const schemeData of defaultSchemes) {
      await Scheme.findOneAndUpdate(
        { name: schemeData.name },
        schemeData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const all = await Scheme.find({});
    res.status(200).json({
      success: true,
      message: 'Sample government schemes seeded successfully',
      count: all.length,
      schemes: all,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all available schemes
 * @route   GET /api/schemes
 * @access  Public
 */
const getAllSchemes = async (req, res, next) => {
  try {
    const schemes = await Scheme.find({});
    res.status(200).json({
      success: true,
      count: schemes.length,
      schemes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  matchSchemes,
  analyzeProfile,
  seedSampleSchemes,
  getAllSchemes,
};


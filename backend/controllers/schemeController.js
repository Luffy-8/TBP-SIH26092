const Scheme = require('../models/Scheme');
const User = require('../models/User');
const Partner = require('../models/Partner');
const { extractDemographicsFromText, generateSchemeExplanation } = require('../utils/aiHelper');

/**
 * Deterministic Rules Engine for Scheme Eligibility (SIH26092 Section 4.3).
 * Evaluates extracted user demographics against MongoDB scheme criteria using strict logic.
 * 
 * @param {Object} profile - Extracted user demographic profile
 * @returns {Promise<Array>} List of eligible schemes with audit reasoning
 */
const GENDER_ALIASES = {
  F: 'FEMALE',
  M: 'MALE',
  WOMAN: 'FEMALE',
  WOMEN: 'FEMALE',
  GIRL: 'FEMALE',
  MAN: 'MALE',
  MEN: 'MALE',
  BOY: 'MALE',
  TRANS: 'TRANSGENDER',
  TRANSGENDER: 'TRANSGENDER',
};

const normalizeGender = (g) => {
  if (!g) return null;
  const key = String(g).toUpperCase().trim();
  return GENDER_ALIASES[key] || key;
};

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

    // 3. Gender Eligibility Audit
    if (criteria.target_gender && criteria.target_gender.length > 0) {
      const normalizedGenders = criteria.target_gender.map((g) => normalizeGender(g));
      const genderWildcard = normalizedGenders.includes('ALL') || normalizedGenders.includes('ANY');

      if (profile.gender) {
        const userGender = normalizeGender(profile.gender);
        const matchesGender = normalizedGenders.includes(userGender) || genderWildcard;

        if (matchesGender) {
          auditLog.push(`Gender match: Scheme targets [${criteria.target_gender.join(', ')}], which includes the applicant's gender (${profile.gender}).`);
        } else {
          isEligible = false;
        }
      } else if (!genderWildcard) {
        auditLog.push(`Gender verification pending: Scheme requires gender [${criteria.target_gender.join(', ')}].`);
      }
    } else {
      auditLog.push('Open to applicants of all genders.');
    }

    if (!isEligible) continue;

    // 4. State Eligibility Audit
    if (criteria.eligible_states && criteria.eligible_states.length > 0) {
      const normalizedStates = criteria.eligible_states.map((s) => s.toUpperCase().trim());
      const stateWildcard = normalizedStates.includes('ALL') || normalizedStates.includes('ANY') || normalizedStates.includes('PAN-INDIA');

      if (profile.state) {
        const userState = profile.state.toUpperCase().trim();
        const matchesState = normalizedStates.includes(userState) || stateWildcard;

        if (matchesState) {
          auditLog.push(`State match: Scheme is available in [${criteria.eligible_states.join(', ')}], which includes the applicant's state (${profile.state}).`);
        } else {
          isEligible = false;
        }
      } else if (!stateWildcard) {
        auditLog.push(`State verification pending: Scheme is restricted to [${criteria.eligible_states.join(', ')}].`);
      }
    } else {
      auditLog.push('Available pan-India across all states.');
    }

    if (!isEligible) continue;

    // 5. Minimum Age Audit
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
            state: extractedDemographics.state,
          },
        },
      },
      { new: true, runValidators: true }
    ).select('-hashed_password');

    // 3. Deterministic Matching Engine
    const eligibleSchemes = await matchSchemes(extractedDemographics);

    // 4. Grounded RAG Explanation & Document Checklist (Phase 4)
    const explanation = await generateSchemeExplanation(extractedDemographics, eligibleSchemes);

    // 5. Phase 5: Geographical Localization & Authorized Channel Partners
    const extractedCity = extractedDemographics.city;
    let localPartners = [];

    if (extractedCity && typeof extractedCity === 'string' && extractedCity.trim().length > 0) {
      const cleanCity = extractedCity.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      localPartners = await Partner.find({
        city: { $regex: cleanCity, $options: 'i' },
      }).lean();
    }

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
      local_partners: localPartners,
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

    const defaultPartners = [
      {
        name: 'Telangana State Scheduled Castes Co-operative Finance Corporation (TSSCCFC)',
        type: 'SCA',
        branch: 'Hyderabad District & State Head Office',
        address: '5th Floor, DSS Bhavan, Masab Tank, Hyderabad, Telangana 500028',
        city: 'Hyderabad',
        state: 'Telangana',
        contact: {
          phone: '040-23391234 / 1800-425-1234',
          hours: 'Mon – Fri, 10:00 AM – 5:00 PM',
          email: 'support@tssccfc.telangana.gov.in',
        },
        role: 'Direct subsidy disbursement, application verification & NSFDC/NSKFDC facilitation',
        query: 'Telangana State Scheduled Castes Co-operative Finance Corporation DSS Bhavan Masab Tank Hyderabad',
      },
      {
        name: 'State Bank of India — Hyderabad Main Branch',
        type: 'Bank',
        branch: 'Lead District Office (LDO), Hyderabad Main',
        address: 'Bank Street, Koti, Hyderabad, Telangana 500095',
        city: 'Hyderabad',
        state: 'Telangana',
        contact: {
          phone: '040-23466100 / 1800-1234-724',
          hours: 'Mon – Sat, 10:00 AM – 4:00 PM',
          email: 'ldo.hyderabad@sbi.co.in',
        },
        role: 'Concessional term loan sanctions, Mudra/PM-DAKSH & Stand-Up India credit processing',
        query: 'State Bank of India Hyderabad Main Branch Bank Street Koti Hyderabad',
      },
      {
        name: 'District Industries Centre (DIC) Hyderabad',
        type: 'DIC',
        branch: 'Hyderabad District Industries Centre',
        address: 'Chirag Ali Lane, Abids, Hyderabad, Telangana 500001',
        city: 'Hyderabad',
        state: 'Telangana',
        contact: {
          phone: '040-23201400',
          hours: 'Mon – Fri, 9:30 AM – 5:30 PM',
          email: 'gm-dic-hyd@telangana.gov.in',
        },
        role: 'Project report preparation support, EDP training & margin money subsidy clearance',
        query: 'District Industries Centre Chirag Ali Lane Abids Hyderabad',
      },
      {
        name: 'State Scheduled Castes Development Corporation (SCA)',
        type: 'SCA',
        branch: 'Lucknow District Office',
        address: 'Vikas Bhawan, Collectorate Complex, Lucknow, Uttar Pradesh 226001',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        contact: {
          phone: '0522-2621000 / 1800-180-8000',
          hours: 'Mon – Fri, 10:00 AM – 5:00 PM',
          email: 'sca-lucknow@up.gov.in',
        },
        role: 'Direct subsidy disbursement, application verification & NSFDC/NSKFDC facilitation',
        query: 'State Scheduled Castes Development Corporation Vikas Bhawan Lucknow',
      },
      {
        name: 'State Bank of India — Lead District Office',
        type: 'Bank',
        branch: 'Lucknow Main Administrative Branch',
        address: 'Station Road, Civil Lines, Lucknow, Uttar Pradesh 226001',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        contact: {
          phone: '0522-2234000 / 1800-1234-724',
          hours: 'Mon – Sat, 10:00 AM – 4:00 PM',
          email: 'leadbank.lucknow@sbi.co.in',
        },
        role: 'Concessional term loan sanctions, Mudra/PM-DAKSH credit line processing',
        query: 'Lead Bank District Office SBI Station Road Civil Lines Lucknow',
      },
      {
        name: 'District Industries Centre (DIC)',
        type: 'DIC',
        branch: 'Industrial Area Office, Lucknow',
        address: 'DIC Compound, Near Subhash Chowk, Lucknow, Uttar Pradesh 226007',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        contact: {
          phone: '0522-2435000',
          hours: 'Mon – Fri, 9:30 AM – 5:30 PM',
          email: 'dic-lucknow@up.gov.in',
        },
        role: 'Project report preparation support, EDP training & margin money subsidy clearance',
        query: 'District Industries Centre DIC Compound Near Subhash Chowk Lucknow',
      },
    ];

    for (const partnerData of defaultPartners) {
      await Partner.findOneAndUpdate(
        { name: partnerData.name, city: partnerData.city },
        partnerData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const all = await Scheme.find({});
    const allPartners = await Partner.find({});
    res.status(200).json({
      success: true,
      message: 'Sample government schemes and local channel partners seeded successfully',
      count: all.length,
      schemes: all,
      partners_count: allPartners.length,
      partners: allPartners,
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

/**
 * @desc    Search channel partners by city and/or state (public partner locator)
 * @route   GET /api/schemes/partners?city=Hyderabad&state=Telangana
 * @access  Public
 */
const getPartners = async (req, res, next) => {
  try {
    const { city, state } = req.query;
    const filter = {};

    if (city && city.trim()) {
      filter.city = { $regex: city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\module.exports = {
  matchSchemes,
  analyzeProfile,
  seedSampleSchemes,
  getAllSchemes,
};'), $options: 'i' };
    }
    if (state && state.trim()) {
      filter.state = { $regex: state.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\module.exports = {
  matchSchemes,
  analyzeProfile,
  seedSampleSchemes,
  getAllSchemes,
};'), $options: 'i' };
    }

    const partners = Object.keys(filter).length > 0
      ? await Partner.find(filter).lean()
      : await Partner.find({}).lean();

    res.status(200).json({
      success: true,
      count: partners.length,
      partners,
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
  getPartners,
};


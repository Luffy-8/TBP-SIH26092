const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Scheme = require('../models/Scheme');
const Partner = require('../models/Partner');

const autoSeedDatabase = async () => {
  try {
    // 1. Ensure default demo user exists
    const existingUser = await User.findOne({ username: 'ramesh_kumar' });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('SecurePassword123!', salt);

      await User.create({
        username: 'ramesh_kumar',
        hashed_password: hashedPassword,
        demographics: {
          age: 28,
          gender: 'Male',
          category: 'SC',
          annual_income: 180000,
          city: 'Lucknow',
        },
      });
      console.log("🌱 Default demo user 'ramesh_kumar' successfully seeded in MongoDB.");
    }

    // 2. Ensure standard government schemes exist
    const schemeCount = await Scheme.countDocuments();
    if (schemeCount === 0) {
      const defaultSchemes = [
        {
          name: 'NSFDC Term Loan Scheme for SC Entrepreneurs',
          issuing_authority: 'National Scheduled Castes Finance and Development Corporation (NSFDC)',
          description: 'Concessional credit scheme for Scheduled Caste (SC) individuals to initiate self-employment and micro-business projects with subsidized interest rates.',
          required_documents: ['Aadhaar Card', 'Caste Certificate (SC)', 'Income Certificate', 'Project Proposal', 'Bank Passbook'],
          eligibility_criteria: { max_income: 300000, target_category: ['SC'], min_age: 18 },
        },
        {
          name: 'New Swarnima Scheme for Women Entrepreneurs',
          issuing_authority: 'National Backward Classes Finance & Development Corporation (NBCFDC)',
          description: 'Special financial assistance loan scheme designed specifically to empower women entrepreneurs from Backward Classes to obtain self-reliance.',
          required_documents: ['Aadhaar Card', 'OBC Caste Certificate', 'Income Certificate', 'Passport Photograph', 'Proof of Residence'],
          eligibility_criteria: { max_income: 300000, target_category: ['OBC'], min_age: 18 },
        },
        {
          name: 'Sanitation Workers Microfinance Scheme',
          issuing_authority: 'National Safai Karamcharis Finance & Development Corporation (NSKFDC)',
          description: 'Micro-credit facility enabling Safai Karamcharis, manual scavengers, and their dependents to establish alternative viable micro-enterprises.',
          required_documents: ['Aadhaar Card', 'Occupation Certificate / Safai Karamchari ID', 'Bank Account Details'],
          eligibility_criteria: { max_income: null, target_category: ['SAFAI KARAMCHARI', 'SC'], min_age: 18 },
        },
        {
          name: 'DNT Livelihood Support Scheme (SEED)',
          issuing_authority: 'Ministry of Social Justice and Empowerment (MoSJE)',
          description: 'Concessional financial assistance to De-Notified, Nomadic and Semi-Nomadic Tribes for small businesses, animal husbandry, and vocational work.',
          required_documents: ['Aadhaar Card', 'DNT Certificate / Community Proof', 'Income Certificate', 'Bank Passbook'],
          eligibility_criteria: { max_income: 250000, target_category: ['DNT', 'ST'], min_age: 18 },
        },
        {
          name: 'PM-DAKSH Skill Development & Micro Enterprise Loan',
          issuing_authority: 'Ministry of Social Justice and Empowerment (MoSJE)',
          description: 'Skill development training followed by concessional microfinance for SC, OBC, EBC, DNT, and Sanitation Workers to launch entrepreneurial ventures.',
          required_documents: ['Aadhaar Card', 'Category Certificate', 'Income Certificate', 'Educational/Skill Certificate'],
          eligibility_criteria: { max_income: 300000, target_category: ['SC', 'OBC', 'DNT', 'SAFAI KARAMCHARI'], min_age: 18 },
        },
      ];

      for (const schemeData of defaultSchemes) {
        await Scheme.findOneAndUpdate(
          { name: schemeData.name },
          schemeData,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
      console.log('🌱 5 default government schemes successfully seeded in MongoDB.');
    }

    // 3. Ensure sample channel partners exist (Hyderabad & Lucknow)
    const defaultPartners = [
      // Hyderabad Partners
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

      // Lucknow Partners
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
    console.log('🌱 Sample channel partners for Hyderabad and Lucknow successfully seeded in MongoDB.');
  } catch (error) {
    console.warn('⚠️ Auto-seed notification:', error.message);
  }
};

module.exports = autoSeedDatabase;

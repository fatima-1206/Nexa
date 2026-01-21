import path from 'path';
import { parseResumeFromFile } from './index';

async function testParser() {
  try {
    console.log('🚀 Starting Resume Parser Test...\n');

    // Path to the test resume PDF
    const resumePath = path.join(__dirname, '..', 'HaiderAkbar_AI_Resume.pdf');
    
    console.log(`📄 Parsing resume: ${resumePath}\n`);

    // Parse the resume
    const result = await parseResumeFromFile(resumePath);

    // Display results in a formatted way
    console.log('✅ PARSING COMPLETE!\n');
    console.log('=' .repeat(80));
    console.log('📋 PARSED RESUME DATA');
    console.log('='.repeat(80));
    
    console.log('\n👤 PROFILE:');
    console.log(JSON.stringify(result.profile, null, 2));
    
    console.log('\n💼 SKILLS (' + result.skills.length + '):');
    console.log(JSON.stringify(result.skills, null, 2));
    
    console.log('\n🏢 WORK EXPERIENCE (' + result.experiences.length + '):');
    console.log(JSON.stringify(result.experiences, null, 2));
    
    console.log('\n🎓 EDUCATION (' + result.education.length + '):');
    console.log(JSON.stringify(result.education, null, 2));
    
    console.log('\n🏆 CERTIFICATIONS (' + result.certifications.length + '):');
    console.log(JSON.stringify(result.certifications, null, 2));
    
    console.log('\n🚀 PROJECTS (' + result.projects.length + '):');
    console.log(JSON.stringify(result.projects, null, 2));
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPLETE JSON OUTPUT:');
    console.log('='.repeat(80));
    console.log(JSON.stringify(result, null, 2));
    
    // Save to file for easy inspection
    const fs = require('fs');
    const outputPath = path.join(__dirname, '..', 'parsed-resume.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\n💾 Full output saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error during parsing:', error);
    process.exit(1);
  }
}

// Run the test
testParser();

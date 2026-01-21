import {
  Profile,
  Experience,
  Education,
  Certification,
  Project,
  ParsedResume,
} from './types';

export class ResumeParser {
  private text: string;

  constructor(text: string) {
    this.text = text;
  }

  /**
   * Main parsing function that extracts all resume data
   */
  parse(): ParsedResume {
    return {
      profile: this.extractProfile(),
      skills: this.extractSkills(),
      experiences: this.extractExperiences(),
      education: this.extractEducation(),
      certifications: this.extractCertifications(),
      projects: this.extractProjects(),
    };
  }

  /**
   * Extract profile information (name, email, phone, etc.)
   */
  private extractProfile(): Profile {
    const profile: Profile = {};

    // Extract name (usually first line or bold text at top)
    const nameMatch = this.text.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/m);
    if (nameMatch) {
      profile.name = nameMatch[1].trim();
    }

    // Extract email
    const emailMatch = this.text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) {
      profile.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = this.text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      profile.phone = phoneMatch[0];
    }

    // Extract LinkedIn
    const linkedinMatch = this.text.match(/(?:linkedin\.com\/in\/)([\w-]+)/i);
    if (linkedinMatch) {
      profile.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;
    }

    // Extract GitHub
    const githubMatch = this.text.match(/(?:github\.com\/)([\w-]+)/i);
    if (githubMatch) {
      profile.github = `github.com/${githubMatch[1]}`;
    }

    // Extract website
    const websiteMatch = this.text.match(/(?:https?:\/\/)?([\w.-]+\.(?:com|io|dev|net|org))/i);
    if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('github')) {
      profile.website = websiteMatch[1];
    }

    // Extract location
    const locationMatch = this.text.match(/(?:Location:|Address:)?\s*([A-Z][a-z]+(?:,?\s+[A-Z]{2})?)/);
    if (locationMatch) {
      profile.location = locationMatch[1];
    }

    // Extract title/role (usually after name or in summary)
    const titleMatch = this.text.match(/(?:AI Engineer|Software Engineer|Data Scientist|Developer|Engineer|CTO|Cofounder)(?:\s+(?:at|@)\s+[\w\s]+)?/i);
    if (titleMatch) {
      profile.title = titleMatch[0];
    }

    // Extract summary/objective
    const summaryMatch = this.text.match(/(?:SUMMARY|OBJECTIVE|ABOUT|PROFILE)[:\n]+\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\n|\n[A-Z]{4,})/is);
    if (summaryMatch) {
      profile.summary = summaryMatch[1].trim().replace(/\s+/g, ' ');
    }

    return profile;
  }

  /**
   * Extract skills from the resume
   */
  private extractSkills(): string[] {
    const skills: string[] = [];
    
    // Look for skills section
    const skillsSection = this.text.match(/(?:SKILLS|TECHNICAL SKILLS|TECHNOLOGIES)[:\n]+\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\n|\n[A-Z]{4,})/is);
    
    if (skillsSection) {
      const skillText = skillsSection[1];
      
      // Split by common delimiters: comma, pipe, bullet, newline
      const skillList = skillText.split(/[,•|·\n]+/);
      
      skillList.forEach((skill) => {
        const cleaned = skill.trim().replace(/^[-–—]\s*/, '');
        if (cleaned && cleaned.length > 2 && cleaned.length < 50) {
          skills.push(cleaned);
        }
      });
    }

    // Also look for common tech keywords throughout the document
    const commonSkills = [
      'Python', 'JavaScript', 'TypeScript', 'Java', 'C\\+\\+', 'C#', 'Go', 'Rust',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
      'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy',
      'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'AI',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
      'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
      'REST API', 'GraphQL', 'Microservices'
    ];

    commonSkills.forEach((skill) => {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      const displayName = skill.replace(/\\\+/g, '+'); // Convert C\+\+ back to C++
      if (regex.test(this.text) && !skills.some(s => s.toLowerCase() === displayName.toLowerCase())) {
        skills.push(displayName);
      }
    });

    return [...new Set(skills)]; // Remove duplicates
  }

  /**
   * Extract work experience
   */
  private extractExperiences(): Experience[] {
    const experiences: Experience[] = [];
    
    // Look for experience section
    const experienceSection = this.text.match(/(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT)[:\n]+\s*([\s\S]*?)(?=\n(?:EDUCATION|PROJECTS|SKILLS|CERTIFICATIONS)|$)/i);
    
    if (experienceSection) {
      const expText = experienceSection[1];
      
      // Split by job entries (usually separated by double newlines or dates)
      const entries = expText.split(/\n(?=\S)/);
      
      let currentExp: Partial<Experience> = {};
      let descriptionBuffer: string[] = [];

      entries.forEach((line) => {
        line = line.trim();
        if (!line) return;

        // Check if it's a date range (experience period)
        const dateMatch = line.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\s*[-–—]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|Present)/i);
        
        if (dateMatch) {
          // If we have a previous experience, save it
          if (currentExp && currentExp.title && currentExp.company) {
            experiences.push({
              title: currentExp.title,
              company: currentExp.company,
              location: currentExp.location || '',
              period: currentExp.period || '',
              description: descriptionBuffer,
            });
          }
          
          // Start new experience
          currentExp = { period: dateMatch[0] };
          descriptionBuffer = [];
        } 
        // Check if it's a job title and company
        else if (line.match(/[A-Z][a-z]+.*(?:Engineer|Developer|Scientist|Manager|Analyst|Designer|CTO|CEO|Founder)/i)) {
          // This might be the title
          if (!currentExp.title) {
            currentExp.title = line;
          } else if (!currentExp.company) {
            currentExp.company = line;
          }
        }
        // Check if it's a location
        else if (line.match(/^[A-Z][a-z]+,\s*[A-Z]{2}$/)) {
          currentExp.location = line;
        }
        // Otherwise it's probably a description bullet point
        else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('–')) {
          descriptionBuffer.push(line.replace(/^[•\-–]\s*/, ''));
        } else if (line.length > 20) {
          descriptionBuffer.push(line);
        }
      });

      // Don't forget the last experience
      if (currentExp.title && currentExp.company) {
        experiences.push({
          title: currentExp.title,
          company: currentExp.company,
          location: currentExp.location || '',
          period: currentExp.period || '',
          description: descriptionBuffer,
        });
      }
    }

    return experiences;
  }

  /**
   * Extract education information
   */
  private extractEducation(): Education[] {
    const education: Education[] = [];
    
    const educationSection = this.text.match(/(?:EDUCATION)[:\n]+\s*([\s\S]*?)(?=\n(?:EXPERIENCE|PROJECTS|SKILLS|CERTIFICATIONS)|$)/i);
    
    if (educationSection) {
      const eduText = educationSection[1];
      
      // Look for degree patterns
      const degreePattern = /(?:Bachelor|Master|PhD|B\.S\.|M\.S\.|Ph\.D\.).*?(?:Computer Science|Engineering|Mathematics|AI|Data Science|Software)/gi;
      const degrees = eduText.match(degreePattern);
      
      if (degrees) {
        degrees.forEach((degree) => {
          const edu: Partial<Education> = {
            degree: degree,
          };
          
          // Try to find school name (usually after degree)
          const schoolMatch = eduText.match(new RegExp(`${degree}[\\s\\S]*?([A-Z][\\w\\s]+(?:University|College|Institute))`));
          if (schoolMatch) {
            edu.school = schoolMatch[1].trim();
          }
          
          // Try to find year
          const yearMatch = eduText.match(/\b(20\d{2})\b/);
          if (yearMatch) {
            edu.year = yearMatch[1];
          }
          
          // Try to find GPA
          const gpaMatch = eduText.match(/GPA[:\s]+(\d\.\d+)/i);
          if (gpaMatch) {
            edu.gpa = `${gpaMatch[1]}/4.0`;
          }
          
          if (edu.degree && edu.school) {
            education.push(edu as Education);
          }
        });
      }
    }

    return education;
  }

  /**
   * Extract certifications
   */
  private extractCertifications(): Certification[] {
    const certifications: Certification[] = [];
    
    const certSection = this.text.match(/(?:CERTIFICATIONS?|LICENSES?)[:\n]+\s*([\s\S]*?)(?=\n(?:EDUCATION|EXPERIENCE|PROJECTS|SKILLS)|$)/i);
    
    if (certSection) {
      const certText = certSection[1];
      const lines = certText.split('\n');
      
      lines.forEach((line) => {
        line = line.trim();
        if (line.length > 10) {
          const cert: Partial<Certification> = {};
          
          // Extract certification name
          cert.name = line.replace(/^[•\-–]\s*/, '').replace(/\s*\(\d{4}\).*$/, '').trim();
          
          // Extract issuer
          const issuerMatch = line.match(/(?:by|from|issued by)\s+([A-Z][\w\s&]+)/i);
          if (issuerMatch) {
            cert.issuer = issuerMatch[1].trim();
          } else if (line.includes('AWS')) {
            cert.issuer = 'Amazon Web Services';
          } else if (line.includes('Google')) {
            cert.issuer = 'Google';
          } else if (line.includes('Microsoft')) {
            cert.issuer = 'Microsoft';
          }
          
          // Extract year
          const yearMatch = line.match(/\b(20\d{2})\b/);
          if (yearMatch) {
            cert.year = yearMatch[1];
          }
          
          if (cert.name && cert.issuer) {
            certifications.push(cert as Certification);
          }
        }
      });
    }

    return certifications;
  }

  /**
   * Extract projects
   */
  private extractProjects(): Project[] {
    const projects: Project[] = [];
    
    const projectSection = this.text.match(/(?:PROJECTS?)[:\n]+\s*([\s\S]*?)(?=\n(?:EDUCATION|EXPERIENCE|SKILLS|CERTIFICATIONS)|$)/i);
    
    if (projectSection) {
      const projText = projectSection[1];
      
      // Split by project entries
      const entries = projText.split(/\n(?=[A-Z])/);
      
      entries.forEach((entry) => {
        const lines = entry.trim().split('\n');
        if (lines.length === 0) return;
        
        const project: Partial<Project> = {};
        
        // First line is usually the project name
        project.name = lines[0].replace(/^[•\-–]\s*/, '').trim();
        
        // Find description (usually the longest line or lines with description keywords)
        const descLines = lines.slice(1).filter(l => l.length > 30);
        if (descLines.length > 0) {
          project.description = descLines.join(' ').replace(/\s+/g, ' ').trim();
        }
        
        // Extract technologies
        const techMatch = entry.match(/(?:Technologies?|Tech Stack|Built with)[:\s]+([^\n]+)/i);
        if (techMatch) {
          project.tech = techMatch[1].split(/[,|•·]/).map(t => t.trim()).filter(t => t.length > 0);
        } else {
          // Try to find tech keywords
          project.tech = [];
          const techKeywords = ['Python', 'JavaScript', 'React', 'Node.js', 'TensorFlow', 'PyTorch', 'AWS', 'Docker', 'Kubernetes'];
          techKeywords.forEach(tech => {
            if (entry.includes(tech)) {
              project.tech!.push(tech);
            }
          });
        }
        
        if (project.name && project.description) {
          projects.push(project as Project);
        }
      });
    }

    return projects;
  }
}

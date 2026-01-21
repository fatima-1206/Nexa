export interface Profile {
  name?: string;
  title?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary?: string;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string[];
}

export interface Education {
  degree: string;
  school: string;
  location: string;
  year: string;
  gpa?: string;
  focus?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export interface Project {
  name: string;
  description: string;
  tech: string[];
  impact?: string;
}

export interface ParsedResume {
  profile: Profile;
  skills: string[];
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
}

import json
import httpx
from typing import Any, Dict, List
from pydantic import BaseModel

from app.core.config import settings
from app.core.exceptions import AIServiceException
from app.models.resume import ParsedResumeData, SkillGroup, ExperienceItem, ProjectItem, EducationItem
from app.models.script import SceneItem

# Define structured Pydantic containers for schema enforcement/validation
class PortfolioAIOutput(BaseModel):
    title: str
    tagline: str
    about: str
    skills: List[SkillGroup]
    experience: List[ExperienceItem]
    projects: List[ProjectItem]
    education: List[EducationItem]

class ScriptAIOutput(BaseModel):
    title: str
    script_text: str
    scenes: List[SceneItem]

class AIPortfolioBlueprintResponse(BaseModel):
    persona: str
    theme: str
    primaryColor: str
    secondaryColor: str
    heroHeadline: str
    tagline: str
    sectionOrder: List[str]
    animationStyle: str
    title: str
    about: str
    skills: List[SkillGroup]
    experience: List[ExperienceItem]
    projects: List[ProjectItem]
    education: List[EducationItem]


class AIService:
    def __init__(self):
        self.model_name = "qwen/qwen3.6-27b"

    def _is_mock_key(self) -> bool:
        return (
            not settings.GROQ_API_KEY 
            or settings.GROQ_API_KEY in ["mock-groq-key", "your-groq-api-key"]
        )

    def _query_groq_json(self, prompt: str, system_prompt: str = "You are a helpful assistant.") -> Dict[str, Any]:
        """
        Helper method to query Groq API using Qwen model with JSON response format.
        """
        if self._is_mock_key():
            raise AIServiceException("Running with mock Groq key. Configure GROQ_API_KEY in .env.", status_code=500)

        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        body = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt + " Respond ONLY with a valid JSON object matching the requested schema. Do not include markdown codeblocks, comments, or explanations outside the JSON block."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {
                "type": "json_object"
            },
            "reasoning_effort": "none",
            "temperature": 0.3
        }

        try:
            res = httpx.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json=body,
                headers=headers,
                timeout=45.0
            )
            if res.status_code == 200:
                content = res.json()["choices"][0]["message"]["content"].strip()
                # Clean up markdown codeblocks if returned
                if content.startswith("```"):
                    lines = content.split("\n")
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines[-1].strip() == "```":
                        lines = lines[:-1]
                    content = "\n".join(lines).strip()
                return json.loads(content)
            else:
                raise AIServiceException(f"Groq API returned status code {res.status_code}: {res.text}")
        except Exception as e:
            raise AIServiceException(f"Failed to query Qwen via Groq: {str(e)}")

    def parse_resume_with_ai(self, raw_text: str) -> Dict[str, Any]:
        """
        Parses raw text of a resume into a structured profile using Qwen via Groq.
        """
        if not raw_text.strip():
            raise AIServiceException("Resume text is empty. Cannot parse.", status_code=400)

        mock_profile = {
            "full_name": "Alex Mercer",
            "email": "alex.mercer@gmail.com",
            "phone": "+1-555-0199",
            "location": "San Francisco, CA",
            "summary": "Full Stack Engineer specializing in FastAPI, React, and cloud architectures. Passionate about building performant web applications and AI-driven platforms.",
            "skills": [
                {"category": "Languages", "skills": ["Python", "JavaScript", "TypeScript", "SQL"]},
                {"category": "Frameworks", "skills": ["FastAPI", "React", "Next.js", "Express"]},
                {"category": "Databases & Cloud", "skills": ["PostgreSQL", "Supabase", "AWS", "Docker"]}
            ],
            "experience": [
                {
                    "company": "TechNova Solutions",
                    "position": "Senior Software Engineer",
                    "start_date": "Jan 2022",
                    "end_date": "Present",
                    "description": "Led the development of a real-time analytics dashboard servicing 10k daily active users.",
                    "achievements": [
                        "Reduced database query latency by 40% through index optimization and query refactoring.",
                        "Architected scalable microservices using FastAPI and Docker containers."
                    ]
                }
            ],
            "projects": [
                {
                    "name": "AI Auto-Portfolio",
                    "description": "A system that ingests resumes and generates interactive developer portfolios and avatar scripts.",
                    "role": "Lead Architect",
                    "technologies": ["FastAPI", "React", "Supabase", "Gemini API"],
                    "url": "https://github.com/alex/auto-portfolio"
                }
            ],
            "education": [
                {
                    "school": "University of California, Berkeley",
                    "degree": "Bachelor of Science",
                    "field_of_study": "Computer Science",
                    "start_date": "2017",
                    "end_date": "2021",
                    "description": "Graduated with honors. Specialized in distributed systems."
                }
            ]
        }

        if self._is_mock_key():
            return mock_profile

        prompt = f"""
        Analyze the following resume text and parse it into a structured JSON profile. 
        Extract the candidate's full name, contact information, professional summary, 
        skills categorized by area, job experiences with specific achievements, projects, and education history.
        
        Resume text:
        ---
        {raw_text}
        ---

        The JSON must match the following JSON schema:
        {json.dumps(ParsedResumeData.model_json_schema(), indent=2)}
        """

        try:
            return self._query_groq_json(prompt, system_prompt="You are a precise resume parser.")
        except Exception as e:
            print(f"[WARNING] Groq parse failed, falling back to mock profile data: {str(e)}")
            return mock_profile

    def generate_portfolio_config(self, parsed_profile: Dict[str, Any], theme_slug: str = "minimalist") -> Dict[str, Any]:
        """
        Takes a structured profile and generates a polished, curated portfolio structure.
        """
        mock_config = {
            "title": f"Senior {parsed_profile.get('full_name', 'Full Stack')} Engineer & Portfolio Builder",
            "tagline": "Building scalable web engines and intelligent cloud architectures.",
            "about": f"Hi, I'm {parsed_profile.get('full_name', 'Alex')}. " + (parsed_profile.get('summary') or "I specialize in backend FastAPI services, Supabase cloud databases, and React frontends. I build high-performance web systems and integrate state-of-the-art AI systems to streamline workflows."),
            "contact_email": parsed_profile.get("email") or "alex.mercer@gmail.com",
            "skills": parsed_profile.get("skills", []),
            "experience": parsed_profile.get("experience", []),
            "projects": parsed_profile.get("projects", []),
            "education": parsed_profile.get("education", []),
            "social_links": {
                "github": "https://github.com",
                "linkedin": "https://linkedin.com"
            }
        }

        if self._is_mock_key():
            return mock_config

        prompt = f"""
        You are an expert web designer and copywriter.
        Transform the following candidate resume profile into a high-converting, professional portfolio website structure.
        Improve the wording where appropriate:
        - Generate a compelling title for the website (e.g., 'Senior Software Architect & Cloud Expert').
        - Write a punchy, modern tagline.
        - Refine the 'about' section to read like an engaging, narrative bio rather than a list of duties.
        - Polish project descriptions and highlight key technical takeaways.
        - Ensure skills, experience, and education lists are well-formatted.
        
        Candidate Profile:
        {json.dumps(parsed_profile, indent=2)}
        
        Selected Theme Style: {theme_slug}

        The JSON must match the following JSON schema:
        {json.dumps(PortfolioAIOutput.model_json_schema(), indent=2)}
        """

        try:
            raw_config = self._query_groq_json(prompt, system_prompt="You are an expert portfolio copywriter.")
            contact_email = parsed_profile.get("email") or mock_config["contact_email"]
            
            return {
                "title": raw_config.get("title"),
                "tagline": raw_config.get("tagline"),
                "about": raw_config.get("about"),
                "contact_email": contact_email,
                "skills": raw_config.get("skills", []),
                "experience": raw_config.get("experience", []),
                "projects": raw_config.get("projects", []),
                "education": raw_config.get("education", []),
                "social_links": {
                    "github": "https://github.com",
                    "linkedin": "https://linkedin.com"
                }
            }
        except Exception as e:
            print(f"[WARNING] Groq generate failed, falling back to mock config: {str(e)}")
            return mock_config

    def generate_portfolio_config_ai(self, parsed_profile: Dict[str, Any], user_instructions: str = "") -> Dict[str, Any]:
        """
        Takes a structured profile and decides layout, colors, sections and copywriting based on custom instructions.
        """
        mock_blueprint = {
            "siteTitle": f"{parsed_profile.get('full_name', 'Alex Mercer')} | Portfolio",
            "tagline": "Building scalable web engines and intelligent cloud architectures.",
            "theme": "Midnight Neon Cyber",
            "primaryColor": "#818cf8",
            "secondaryColor": "#a78bfa",
            "typography": "Space Grotesk",
            "animationStyle": "fade-in-up",
            "heroSection": {
                "headline": f"Building Scalable Futures with {parsed_profile.get('full_name', 'Alex Mercer')}",
                "subheadline": "Full Stack Engineer specializing in FastAPI, React, and cloud architectures.",
                "ctaText": "Get in Touch",
                "backgroundImage": ""
            },
            "aboutSection": {
                "title": "About Me",
                "description": f"Hi, I'm {parsed_profile.get('full_name', 'Alex Mercer')}. " + (parsed_profile.get('summary') or "I specialize in backend FastAPI services, Supabase cloud databases, and React frontends."),
                "bioParagraphs": [
                    "I am a software engineer with over 5 years of experience designing real-time dashboard analytics systems and cloud solutions.",
                    "Passionate about clean code, performance optimization, and accessible UI components."
                ],
                "profileImage": ""
            },
            "skillsSection": {
                "title": "My Skills",
                "categories": [
                    {
                        "name": "Frontend",
                        "items": ["React", "TypeScript", "Tailwind CSS", "Next.js"]
                    },
                    {
                        "name": "Backend",
                        "items": ["FastAPI", "Python", "Node.js", "PostgreSQL"]
                    }
                ]
              },
            "projectsSection": {
                "title": "Featured Projects",
                "items": [
                    {
                        "title": "AI Auto-Portfolio Builder",
                        "description": "A system that ingests resumes and generates interactive developer portfolios and avatar scripts.",
                        "technologies": ["FastAPI", "React", "Supabase", "Gemini API"],
                        "link": "https://github.com/alex/auto-portfolio",
                        "role": "Lead Architect"
                    }
                ]
            },
            "experienceSection": {
                "title": "Work Experience",
                "items": [
                    {
                        "role": "Senior Software Engineer",
                        "company": "TechNova Solutions",
                        "duration": "Jan 2022 - Present",
                        "achievements": [
                            "Reduced database query latency by 40% through index optimization and query refactoring.",
                            "Architected scalable microservices using FastAPI and Docker containers."
                        ],
                        "description": "Led the development of a real-time analytics dashboard servicing 10k daily active users."
                    }
                ]
            },
            "contactSection": {
                "title": "Let's Connect",
                "description": "Feel free to reach out for collaborations, project requests, or just to say hello!",
                "email": parsed_profile.get("email") or "alex.mercer@gmail.com",
                "socialLinks": {
                    "github": "https://github.com",
                    "linkedin": "https://linkedin.com",
                    "twitter": "https://twitter.com"
                }
            },
            "sectionOrder": ["aboutSection", "skillsSection", "projectsSection", "experienceSection", "contactSection"]
        }

        if self._is_mock_key():
            mock_blueprint["theme"] = f"{user_instructions or 'Cyberpunk Vibe'} Custom Theme"
            return mock_blueprint

        prompt = f"""
        You are a highly advanced portfolio designer and copywriter LLM.
        Analyze this parsed candidate resume JSON and the user's dream portfolio description instructions.
        Create a complete, tailored portfolio website styling and copywriting blueprint.
        
        Candidate Profile JSON:
        {json.dumps(parsed_profile, indent=2)}
        
        User Instructions / Dream Portfolio Description:
        ---
        {user_instructions}
        ---
        
        The JSON must match the following JSON schema:
        {json.dumps(AIPortfolioBlueprintResponse.model_json_schema(), indent=2)}
        """

        try:
            return self._query_groq_json(prompt, system_prompt="You are a creative portfolio designer.")
        except Exception as e:
            print(f"[WARNING] Groq generate_ai failed, falling back to mock blueprint: {str(e)}")
            return mock_blueprint

    def generate_video_script(self, portfolio_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a 1-minute introduction video script with scenes and cues.
        """
        mock_script = {
            "title": f"{portfolio_data.get('title', 'Developer')} - 60s Introduction",
            "script_text": f"Hi, I'm a software developer. I specialize in FastAPI, React, and cloud architectures. Over the years, I've designed real-time dashboard analytics systems and compiled interactive developer setups. Thanks for visiting my site, and let's build something great together!",
            "scenes": [
              {
                "scene_number": 1,
                "visual_prompt": "Avatar standing in front of a sleek tech background, smiling at the camera.",
                "voiceover": f"Hi, I'm a developer. {portfolio_data.get('tagline', 'I build high-performance web systems.')}"
              },
              {
                "scene_number": 2,
                "visual_prompt": "Transition to a split-screen layout showing database graphs and code blocks.",
                "voiceover": "Over the years, I've designed real-time dashboard analytics systems and compiled interactive setups."
              },
              {
                "scene_number": 3,
                "visual_prompt": "Zoom back to the avatar, who gestures towards the screen controls.",
                "voiceover": "Thanks for visiting my site, and let's build something great together!"
              }
            ]
        }

        if self._is_mock_key():
            return mock_script

        prompt = f"""
        Create a 60-second video introduction script for an AI avatar/presenter based on this portfolio website profile.
        The script should introduce the user, highlight their top 2-3 projects and core skillset, and invite viewers to connect.
        Provide a list of scenes with visual prompts and corresponding spoken text (voiceover).
        
        Portfolio Profile:
        - Title: {portfolio_data.get('title')}
        - Tagline: {portfolio_data.get('tagline')}
        - About: {portfolio_data.get('about')}
        - Skills: {json.dumps(portfolio_data.get('skills'))}
        - Top Projects: {json.dumps(portfolio_data.get('projects', [])[:3])}

        The JSON must match the following JSON schema:
        {json.dumps(ScriptAIOutput.model_json_schema(), indent=2)}
        """

        try:
            return self._query_groq_json(prompt, system_prompt="You are a video producer.")
        except Exception as e:
            print(f"[WARNING] Groq script gen failed, falling back to mock script: {str(e)}")
            return mock_script

# Global Singleton
ai_service = AIService()

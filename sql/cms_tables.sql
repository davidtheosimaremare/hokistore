-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    author_id UUID REFERENCES admin_users(id),
    tags TEXT[], -- Array of tags
    meta_title VARCHAR(255),
    meta_description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Comments Table
CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'rejected')),
    ip_address INET,
    user_agent TEXT,
    parent_id UUID REFERENCES blog_comments(id), -- For nested comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    featured_image TEXT,
    gallery_images TEXT[], -- Array of image URLs
    client_name VARCHAR(255),
    project_type VARCHAR(100),
    industry VARCHAR(100),
    technologies TEXT[], -- Array of technologies used
    project_url VARCHAR(255),
    github_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
    start_date DATE,
    end_date DATE,
    budget_range VARCHAR(50),
    team_size INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio/References Table
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    featured_image TEXT,
    gallery_images TEXT[], -- Array of image URLs
    client_name VARCHAR(255) NOT NULL,
    client_logo TEXT,
    client_website VARCHAR(255),
    testimonial TEXT,
    testimonial_author VARCHAR(255),
    testimonial_position VARCHAR(255),
    category VARCHAR(100), -- e.g., 'automation', 'industrial', 'software'
    services_provided TEXT[], -- Array of services
    project_duration VARCHAR(50),
    project_value VARCHAR(50),
    completion_date DATE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career/Job Postings Table
CREATE TABLE IF NOT EXISTS career_postings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    employment_type VARCHAR(50) DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship')),
    experience_level VARCHAR(50) DEFAULT 'mid_level' CHECK (experience_level IN ('entry_level', 'mid_level', 'senior_level', 'executive')),
    salary_range VARCHAR(100),
    job_description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    benefits TEXT,
    skills_required TEXT[], -- Array of required skills
    education_level VARCHAR(100),
    application_deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    remote_friendly BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    career_posting_id UUID REFERENCES career_postings(id) ON DELETE CASCADE,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50),
    resume_url TEXT,
    cover_letter TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    experience_years INTEGER,
    current_position VARCHAR(255),
    current_company VARCHAR(255),
    expected_salary VARCHAR(100),
    availability_date DATE,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'shortlisted', 'interviewed', 'rejected', 'hired')),
    notes TEXT, -- Internal notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_is_featured ON portfolio_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON portfolio_items(category);
CREATE INDEX IF NOT EXISTS idx_career_postings_is_active ON career_postings(is_active);
CREATE INDEX IF NOT EXISTS idx_career_postings_department ON career_postings(department);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_career_posting_id ON job_applications(career_posting_id);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access and admin write access
-- Blog Posts Policies
CREATE POLICY "Blog posts are viewable by everyone" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admin can manage blog posts" ON blog_posts FOR ALL USING (true);

-- Blog Comments Policies
CREATE POLICY "Approved comments are viewable by everyone" ON blog_comments FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can insert comments" ON blog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can manage comments" ON blog_comments FOR ALL USING (true);

-- Projects Policies
CREATE POLICY "Active projects are viewable by everyone" ON projects FOR SELECT USING (status IN ('active', 'completed'));
CREATE POLICY "Admin can manage projects" ON projects FOR ALL USING (true);

-- Portfolio Policies
CREATE POLICY "Portfolio items are viewable by everyone" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Admin can manage portfolio" ON portfolio_items FOR ALL USING (true);

-- Career Policies
CREATE POLICY "Active job postings are viewable by everyone" ON career_postings FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage job postings" ON career_postings FOR ALL USING (true);

-- Job Applications Policies
CREATE POLICY "Job applications are private" ON job_applications FOR SELECT USING (false);
CREATE POLICY "Anyone can submit applications" ON job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can manage applications" ON job_applications FOR ALL USING (true);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON blog_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_postings_updated_at BEFORE UPDATE ON career_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
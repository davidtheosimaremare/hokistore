"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { 
  Calendar,
  Clock,
  User,
  Tag,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Heart,
  MessageCircle,
  Send,
  TrendingUp,
  Zap,
  Settings,
  Building,
  Factory,
  Shield,
  BookOpen,
  Quote,
  ArrowRight
} from "lucide-react";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    bio: string;
    social: {
      twitter?: string;
      linkedin?: string;
    };
  };
  publishDate: string;
  readTime: number;
  image: string;
  featured: boolean;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  date: string;
  replies?: Comment[];
}

// Sample blog posts data (same as blog list page)
const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "future-of-industrial-automation-indonesia",
    title: "The Future of Industrial Automation in Indonesia: Trends and Opportunities",
    excerpt: "Explore how Industry 4.0 technologies are transforming manufacturing landscapes across Indonesia, from smart factories to predictive maintenance systems.",
    content: `
      <h2>Introduction to Industry 4.0 in Indonesia</h2>
      <p>Indonesia's manufacturing sector is undergoing a profound transformation as Industry 4.0 technologies reshape traditional production processes. With a growing emphasis on efficiency, quality, and sustainability, Indonesian manufacturers are increasingly adopting advanced automation solutions to remain competitive in the global market.</p>
      
      <p>The integration of smart technologies, IoT sensors, and artificial intelligence is creating new opportunities for optimization across various industries, from automotive and textiles to food processing and petrochemicals.</p>
      
      <h2>Key Trends Driving Automation Adoption</h2>
      
      <h3>1. Smart Factory Implementation</h3>
      <p>Modern manufacturing facilities are evolving into smart factories where interconnected systems communicate seamlessly. These facilities leverage:</p>
      <ul>
        <li>Advanced PLC systems like SIMATIC S7-1500 for comprehensive process control</li>
        <li>HMI interfaces that provide real-time operational insights</li>
        <li>Predictive maintenance systems that minimize downtime</li>
        <li>Energy management solutions for sustainable operations</li>
      </ul>
      
      <h3>2. IoT Integration and Data Analytics</h3>
      <p>The Internet of Things (IoT) is revolutionizing how manufacturers collect and analyze operational data. Key benefits include:</p>
      <ul>
        <li>Real-time monitoring of equipment performance</li>
        <li>Predictive analytics for maintenance scheduling</li>
        <li>Quality control through continuous monitoring</li>
        <li>Supply chain optimization</li>
      </ul>
      
      <blockquote>
        "The future of manufacturing lies in the seamless integration of digital technologies with traditional industrial processes. Companies that embrace this transformation will gain significant competitive advantages."
      </blockquote>
      
      <h2>Opportunities in the Indonesian Market</h2>
      <p>Indonesia's strategic location, growing economy, and government support for industrial modernization create numerous opportunities for automation implementation:</p>
      
      <h3>Government Initiatives</h3>
      <p>The Indonesian government's "Making Indonesia 4.0" roadmap prioritizes five key industries for digital transformation:</p>
      <ul>
        <li>Food and beverages</li>
        <li>Textiles and apparel</li>
        <li>Automotive</li>
        <li>Chemical</li>
        <li>Electronics</li>
      </ul>
      
      <h3>Investment in Infrastructure</h3>
      <p>Significant investments in digital infrastructure, including 5G networks and industrial internet connectivity, are creating the foundation for advanced automation implementations.</p>
      
      <h2>Implementation Challenges and Solutions</h2>
      <p>While opportunities abound, manufacturers face several challenges when implementing automation solutions:</p>
      
      <h3>Skills Gap</h3>
      <p>The transition to automated systems requires specialized skills. Solutions include:</p>
      <ul>
        <li>Comprehensive training programs for existing workforce</li>
        <li>Partnerships with technical universities</li>
        <li>Collaboration with automation solution providers</li>
      </ul>
      
      <h3>Initial Investment Costs</h3>
      <p>High upfront costs can be a barrier. However, the ROI typically justifies the investment through:</p>
      <ul>
        <li>Reduced operational costs</li>
        <li>Improved quality and reduced waste</li>
        <li>Enhanced productivity</li>
        <li>Better regulatory compliance</li>
      </ul>
      
      <h2>Future Outlook</h2>
      <p>The future of industrial automation in Indonesia looks promising, with continued growth expected across all manufacturing sectors. Key developments to watch include:</p>
      
      <ul>
        <li>Increased adoption of AI and machine learning in production processes</li>
        <li>Greater emphasis on cybersecurity in industrial systems</li>
        <li>Development of local automation expertise and suppliers</li>
        <li>Integration of sustainability metrics into automation systems</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Indonesia's industrial automation journey is just beginning, but the foundation for transformation is strong. Companies that invest in modern automation technologies today will be well-positioned to capitalize on the opportunities that lie ahead. The key to success lies in choosing the right technology partners, investing in workforce development, and taking a strategic approach to digital transformation.</p>
      
      <p>As we move forward, the collaboration between technology providers, manufacturers, and government initiatives will be crucial in realizing the full potential of Industry 4.0 in Indonesia.</p>
    `,
    category: "Industry Insights",
    tags: ["Industry 4.0", "Automation", "Smart Factory", "Indonesia"],
    author: {
      name: "Dr. Agus Prasetyo",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      bio: "Senior Industrial Automation Consultant with 15+ years experience in manufacturing optimization. Dr. Prasetyo has led digital transformation projects across Southeast Asia and specializes in Industry 4.0 implementations.",
      social: {
        twitter: "@aguspras",
        linkedin: "agus-prasetyo"
      }
    },
    publishDate: "2024-01-15",
    readTime: 8,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=600&fit=crop",
    featured: true
  }
  // Add other posts as needed for related posts section
];

// Sample comments data
const sampleComments: Comment[] = [
  {
    id: 1,
    author: "Budi Santoso",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    content: "Excellent article! We've just started implementing SIMATIC S7-1500 systems in our textile factory and the results are impressive. The predictive maintenance capabilities alone have reduced our downtime by 30%.",
    date: "2024-01-16",
    replies: [
      {
        id: 2,
        author: "Dr. Agus Prasetyo",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
        content: "Thank you for sharing your experience, Budi! That's exactly the kind of ROI we're seeing across the industry. Have you considered implementing energy monitoring systems as well?",
        date: "2024-01-16"
      }
    ]
  },
  {
    id: 3,
    author: "Sari Wulandari",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b593?w=50&h=50&fit=crop&crop=face",
    content: "This is very timely as our company is evaluating automation solutions. The government initiatives mentioned here are particularly encouraging for manufacturers like us.",
    date: "2024-01-17"
  }
];

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Find the current post
  useEffect(() => {
    const foundPost = blogPosts.find(p => p.slug === slug);
    setPost(foundPost || null);
  }, [slug]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
          <Link href="/blog" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Industry Insights": return TrendingUp;
      case "Technical Guide": return Settings;
      case "Energy Management": return Zap;
      case "Maintenance Strategy": return Factory;
      case "Safety & Compliance": return Shield;
      case "Building Automation": return Building;
      case "Digital Transformation": return BookOpen;
      case "Water Management": return Shield;
      default: return BookOpen;
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        author: "Current User",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face",
        content: newComment,
        date: new Date().toISOString().split('T')[0]
      };
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `${post.title} - ${post.excerpt}`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          alert('Link copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy link');
        }
        break;
    }
  };

  const IconComponent = getCategoryIcon(post.category);
  const relatedPosts = blogPosts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/blog" className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-200">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <article className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category and Meta */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                {post.category}
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.publishDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Author and Social Share */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-semibold text-gray-900">{post.author.name}</p>
                <p className="text-gray-600 text-sm">{post.author.bio.split('.')[0]}.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm mr-2">Share:</span>
              <button 
                onClick={() => handleShare('twitter')}
                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleShare('facebook')}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleShare('linkedin')}
                className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <Linkedin className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleShare('copy')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <LinkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="w-full">
          <img src={post.image} alt={post.title} className="w-full h-64 md:h-96 object-cover" />
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" ref={contentRef}>
          <div className={`prose prose-lg max-w-none py-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div 
              className="prose-headings:font-bold prose-headings:text-gray-900 prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-ul:text-gray-700 prose-li:mb-2 prose-blockquote:border-l-4 prose-blockquote:border-red-500 prose-blockquote:bg-red-50 prose-blockquote:p-6 prose-blockquote:text-gray-800 prose-blockquote:italic prose-blockquote:rounded-r-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Tags */}
          <div className="py-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm flex items-center gap-1 transition-colors duration-200 cursor-pointer"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Engagement Actions */}
          <div className="flex items-center justify-between py-6 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  liked 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span>{liked ? 'Liked' : 'Like'}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span>{comments.length} Comments</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 text-sm">Share this article</span>
            </div>
          </div>
        </div>
      </article>

      {/* Author Bio Section */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row gap-6">
              <img src={post.author.avatar} alt={post.author.name} className="w-24 h-24 rounded-full mx-auto md:mx-0" />
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.author.name}</h3>
                <p className="text-gray-600 mb-4">{post.author.bio}</p>
                <div className="flex justify-center md:justify-start gap-3">
                  {post.author.social.twitter && (
                    <a 
                      href={`https://twitter.com/${post.author.social.twitter}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {post.author.social.linkedin && (
                    <a 
                      href={`https://linkedin.com/in/${post.author.social.linkedin}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-700 transition-colors duration-200"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 group">
                    <img src={relatedPost.image} alt={relatedPost.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200" />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors duration-200">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{relatedPost.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(relatedPost.publishDate)}</span>
                        <div className="flex items-center gap-1 text-red-600 font-semibold">
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Comments Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Comments ({comments.length})</h2>
          
          {/* Comment Form */}
          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a Comment</h3>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this article..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Post Comment
                </button>
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-start gap-4">
                  <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                      <span className="text-gray-500 text-sm">{formatDate(comment.date)}</span>
                    </div>
                    <p className="text-gray-700 mb-4">{comment.content}</p>
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-6 space-y-4 pt-4 border-t border-gray-100">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <img src={reply.avatar} alt={reply.author} className="w-8 h-8 rounded-full" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-semibold text-gray-900 text-sm">{reply.author}</h5>
                                <span className="text-gray-500 text-xs">{formatDate(reply.date)}</span>
                              </div>
                              <p className="text-gray-700 text-sm">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 
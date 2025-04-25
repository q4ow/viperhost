---
title: "Building AnonHost's File Upload System"
date: "2024-04-25"
excerpt: "An in-depth technical look at how I built the file upload system powering AnonHost, covering architecture decisions, challenges, and lessons learned."
---

As the solo developer of [AnonHost](https://anon.love), I wanted to share an in-depth look at how I built the file upload system that powers the platform. This post details the technical challenges I faced and the solutions I developed to create a reliable, user-friendly upload experience.
## Initial Requirements

When I started building the site, I had several key requirements:

- Support multiple file types (images, videos, audio, documents)
    
- Handle large files efficiently
    
- Provide real-time feedback to users
    
- Implement strict file validation
    
- Enforce tier-based limits
    
- Ensure security and prevent abuse
    
- Support concurrent uploads
    
- Handle paste events for quick sharing
    

## Technical Implementation

### Storage Architecture

I chose Cloudflare R2 as my storage solution for several reasons:

- Cost-effective for a bootstrapped project
    
- Global edge network for fast downloads
    
- S3-compatible API
    
- No egress fees
    
- Built-in CDN capabilities
    

### File Processing Pipeline

My upload pipeline follows these steps:

1. Client-side validation (size, type)
    
2. Concurrent upload handling (max 3 simultaneous)
    
3. Server-side validation
    
4. File processing and optimization
    
5. R2 storage upload
    
6. Database record creation
    
7. URL generation
    

## Major Challenges I Overcame

### 1. Concurrent Upload Management

The first major challenge was handling multiple file uploads efficiently. Users often want to upload several files at once, but allowing unlimited concurrent uploads could overwhelm both the client and server.

I implemented a queue system using p-limit that maintains a maximum of three simultaneous uploads while queuing the rest. This provides a good balance between speed and system stability.

### 2. Progress Tracking

Implementing accurate progress tracking was trickier than expected. I built a system that tracks:

- Individual file progress
    
- Overall batch progress
    
- Upload speed
    
- Estimated time remaining
    
- Success/failure status per file
    

### 3. Storage Management

Managing storage quotas and file size limits required careful consideration:

- Free tier: 500MB total storage, 100MB per file
    
- Premium tier: 1GB total storage, 500MB per file
    
- Real-time quota tracking
    
- Automatic cleanup of expired files
    
- Custom domain support per file
    

### 4. Security Implementation

Security was a top priority. I implemented:

- Strict file type validation on both ends
    
- Content-type verification
    
- Rate limiting for uploads
    
- API key authentication
    
- Secure URL generation
    
- Upload permission verification
    

### 5. User Experience Enhancements

I focused heavily on user experience:

- Drag and drop support
    
- Clipboard paste functionality
    
- File preview generation
    
- Progress animations
    
- Error handling with clear messages
    
- Settings per file (privacy, domain)
    

## Database Structure

I designed the database schema to efficiently track:

- File metadata (size, type, dimensions)
    
- User quotas and usage
    
- Custom domains
    
- File privacy settings
    
- Upload statistics
    

## Production Considerations

### Performance Optimization

- Image optimization before storage
    
- Efficient database queries
    
- Caching strategies
    
- CDN integration
    
- Concurrent upload limiting
    

### Monitoring and Maintenance

- Upload success rates
    
- Storage usage tracking
    
- Error logging
    
- Performance metrics
    
- User feedback collection
    

## Lessons Learned

1. Always validate files server-side, regardless of client validation
    
2. Use typed interfaces everywhere
    
3. Implement proper error handling early
    
4. Monitor and log everything
    
5. Plan for scale from the start
    
6. Test with various file types and sizes
    
7. Consider edge cases (network issues, browser differences)
    

## Future Improvements

I'm planning several enhancements:

1. Chunked uploads for larger files
    

2. Better progress visualization
    

3. Enhanced media processing
    

4. Expanded file type support
    

5. More detailed analytics
    

6. Improved error recovery
    

7. Better compression options
    

## Technical Deep Dive

### File Processing

For each upload, I:

1. Generate a unique ID
    
2. Validate content type
    
3. Check user quotas
    
4. Process file metadata
    
5. Handle custom domain routing
    
6. Create database records
    
7. Generate access URLs
    

### Error Handling

I implemented comprehensive error handling for:

- Network failures
    
- Storage errors
    
- Quota exceeded
    
- Invalid file types
    
- Authentication issues
    
- Rate limiting
    
- Database errors
    

## Conclusion

Building this upload system has been a challenging but rewarding journey. It's now handling hundreds of uploads reliably, and the feedback from users (one user in particular) has been overwhelmingly positive. I'm constantly working on improvements and new features based on user feedback and monitoring data so keep it coming!

If you're interested in the technical details or have questions about specific implementations, feel free to reach out to me on our [Discord](https://discord.gg/jPxJ52GF3r).
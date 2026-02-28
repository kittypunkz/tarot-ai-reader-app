# Web Application Security Checklist

Use this checklist to ensure security is properly addressed in user stories.

## Authentication & Authorization

### Authentication
- [ ] Password requirements enforced (min length, complexity)
- [ ] Password hashing (bcrypt, Argon2) - never store plain text
- [ ] Brute force protection (rate limiting, account lockout)
- [ ] Session management (secure tokens, expiration)
- [ ] JWT security if applicable (short expiry, refresh tokens, secure storage)
- [ ] Multi-factor authentication (MFA) for sensitive operations
- [ ] Social login security (OAuth 2.0, state parameter, PKCE)

### Authorization
- [ ] Role-based access control (RBAC) implementation
- [ ] Resource-level permissions (can user X access resource Y?)
- [ ] Principle of least privilege
- [ ] API endpoint authorization checks
- [ ] UI element visibility based on permissions
- [ ] Server-side authorization validation (never trust client)

## Data Protection

### Input Validation
- [ ] Validate all user inputs (type, length, format, range)
- [ ] Whitelist validation approach
- [ ] SQL injection prevention (parameterized queries, ORM)
- [ ] NoSQL injection prevention
- [ ] XSS prevention (output encoding, CSP headers)
- [ ] CSRF protection (tokens, SameSite cookies)
- [ ] File upload validation (type, size, content scanning)
- [ ] Command injection prevention

### Data at Rest
- [ ] Encryption for sensitive data (PII, credentials, payment info)
- [ ] Encryption key management
- [ ] Database encryption (TDE if required)
- [ ] Backup encryption

### Data in Transit
- [ ] HTTPS everywhere (TLS 1.2+)
- [ ] HSTS headers
- [ ] Secure cookie attributes (Secure, HttpOnly, SameSite)
- [ ] API communication over HTTPS only

## Session Management
- [ ] Secure session ID generation
- [ ] Session expiration (idle timeout, absolute timeout)
- [ ] Secure session storage
- [ ] Session invalidation on logout
- [ ] Concurrent session handling
- [ ] Session fixation protection

## API Security
- [ ] Rate limiting/throttling
- [ ] API authentication (API keys, OAuth, JWT)
- [ ] Request size limits
- [ ] CORS configuration (whitelist origins)
- [ ] API versioning for breaking changes
- [ ] Input schema validation
- [ ] Error handling (no sensitive info in error messages)
- [ ] Logging and monitoring

## Infrastructure Security
- [ ] Security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- [ ] DDoS protection
- [ ] WAF (Web Application Firewall) if needed
- [ ] Dependency vulnerability scanning
- [ ] Container security (if applicable)
- [ ] Secrets management (no hardcoded credentials)
- [ ] Environment variable security

## Privacy & Compliance
- [ ] PII handling per GDPR/CCPA requirements
- [ ] Data retention policies
- [ ] Right to deletion (GDPR)
- [ ] Data export capabilities
- [ ] Consent management
- [ ] Privacy policy compliance
- [ ] Audit logging for sensitive operations

## Common Vulnerabilities to Prevent
- [ ] SQL Injection
- [ ] Cross-Site Scripting (XSS)
- [ ] Cross-Site Request Forgery (CSRF)
- [ ] Insecure Direct Object References (IDOR)
- [ ] Security Misconfiguration
- [ ] Sensitive Data Exposure
- [ ] Missing Function Level Access Control
- [ ] Cross-Origin Resource Sharing (CORS) misconfiguration
- [ ] Unvalidated Redirects and Forwards
- [ ] Clickjacking

## Security Testing
- [ ] Automated security scanning
- [ ] Dependency vulnerability checks
- [ ] Penetration testing for critical features
- [ ] Security code reviews
- [ ] Input fuzzing

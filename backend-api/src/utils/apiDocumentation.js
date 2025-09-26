const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Advanced API documentation generator
 */

class APIDocumentationGenerator {
  constructor(options = {}) {
    this.outputDir = options.outputDir || './docs/api';
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.version = options.version || '1.0.0';
    this.title = options.title || 'AI Social Media Management Platform API';
    this.description = options.description || 'Comprehensive API for managing social media content, analytics, and AI agents';
    
    this.routes = [];
    this.schemas = [];
    this.securitySchemes = [];
    this.tags = [];
    
    // Ensure output directory exists
    this.ensureOutputDir();
  }

  /**
   * Ensure output directory exists
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Add route to documentation
   */
  addRoute(route) {
    this.routes.push({
      method: route.method.toUpperCase(),
      path: route.path,
      summary: route.summary || '',
      description: route.description || '',
      tags: route.tags || [],
      parameters: route.parameters || [],
      requestBody: route.requestBody || null,
      responses: route.responses || {},
      security: route.security || [],
      deprecated: route.deprecated || false,
      examples: route.examples || []
    });
  }

  /**
   * Add schema to documentation
   */
  addSchema(schema) {
    this.schemas.push(schema);
  }

  /**
   * Add security scheme
   */
  addSecurityScheme(scheme) {
    this.securitySchemes.push(scheme);
  }

  /**
   * Add tag
   */
  addTag(tag) {
    this.tags.push(tag);
  }

  /**
   * Generate OpenAPI 3.0 specification
   */
  generateOpenAPISpec() {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: this.title,
        description: this.description,
        version: this.version,
        contact: {
          name: 'API Support',
          email: 'support@example.com',
          url: 'https://example.com/support'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: this.baseUrl,
          description: 'Development server'
        },
        {
          url: 'https://api.example.com',
          description: 'Production server'
        }
      ],
      paths: this.generatePaths(),
      components: {
        schemas: this.generateSchemas(),
        securitySchemes: this.generateSecuritySchemes(),
        parameters: this.generateCommonParameters(),
        responses: this.generateCommonResponses()
      },
      tags: this.tags,
      security: [
        {
          bearerAuth: []
        }
      ]
    };

    return spec;
  }

  /**
   * Generate paths object
   */
  generatePaths() {
    const paths = {};

    this.routes.forEach(route => {
      if (!paths[route.path]) {
        paths[route.path] = {};
      }

      paths[route.path][route.method.toLowerCase()] = {
        summary: route.summary,
        description: route.description,
        tags: route.tags,
        parameters: route.parameters,
        requestBody: route.requestBody,
        responses: route.responses,
        security: route.security,
        deprecated: route.deprecated
      };
    });

    return paths;
  }

  /**
   * Generate schemas object
   */
  generateSchemas() {
    const schemas = {};

    this.schemas.forEach(schema => {
      schemas[schema.name] = schema.definition;
    });

    return schemas;
  }

  /**
   * Generate security schemes
   */
  generateSecuritySchemes() {
    const schemes = {};

    this.securitySchemes.forEach(scheme => {
      schemes[scheme.name] = scheme.definition;
    });

    return schemes;
  }

  /**
   * Generate common parameters
   */
  generateCommonParameters() {
    return {
      PageParam: {
        name: 'page',
        in: 'query',
        description: 'Page number for pagination',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1
        }
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20
        }
      },
      SortParam: {
        name: 'sort',
        in: 'query',
        description: 'Sort field and direction',
        required: false,
        schema: {
          type: 'string',
          pattern: '^[a-zA-Z0-9_]+:(asc|desc)$',
          example: 'createdAt:desc'
        }
      },
      SearchParam: {
        name: 'search',
        in: 'query',
        description: 'Search query',
        required: false,
        schema: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        }
      }
    };
  }

  /**
   * Generate common responses
   */
  generateCommonResponses() {
    return {
      Success: {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: true
                },
                message: {
                  type: 'string',
                  example: 'Operation completed successfully'
                },
                data: {
                  type: 'object'
                }
              }
            }
          }
        }
      },
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                message: {
                  type: 'string',
                  example: 'Invalid request parameters'
                },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string'
                      },
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                message: {
                  type: 'string',
                  example: 'Authentication required'
                },
                code: {
                  type: 'string',
                  example: 'AUTH_REQUIRED'
                }
              }
            }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                message: {
                  type: 'string',
                  example: 'Insufficient permissions'
                },
                code: {
                  type: 'string',
                  example: 'PERMISSION_DENIED'
                }
              }
            }
          }
        }
      },
      NotFound: {
        description: 'Not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                message: {
                  type: 'string',
                  example: 'Resource not found'
                },
                code: {
                  type: 'string',
                  example: 'NOT_FOUND'
                }
              }
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                message: {
                  type: 'string',
                  example: 'Internal server error'
                },
                code: {
                  type: 'string',
                  example: 'INTERNAL_ERROR'
                }
              }
            }
          }
        }
      }
    };
  }

  /**
   * Generate Markdown documentation
   */
  generateMarkdownDocs() {
    let markdown = `# ${this.title}\n\n`;
    markdown += `${this.description}\n\n`;
    markdown += `## Table of Contents\n\n`;
    
    // Generate table of contents
    const tags = [...new Set(this.routes.map(route => route.tags).flat())];
    tags.forEach(tag => {
      markdown += `- [${tag}](#${tag.toLowerCase().replace(/\s+/g, '-')})\n`;
    });
    
    markdown += `\n## Authentication\n\n`;
    markdown += `This API uses Bearer token authentication. Include the token in the Authorization header:\n\n`;
    markdown += `\`\`\`\nAuthorization: Bearer <your-token>\n\`\`\`\n\n`;
    
    // Generate documentation for each tag
    tags.forEach(tag => {
      const tagRoutes = this.routes.filter(route => route.tags.includes(tag));
      
      markdown += `## ${tag}\n\n`;
      
      tagRoutes.forEach(route => {
        markdown += `### ${route.method} ${route.path}\n\n`;
        markdown += `${route.description}\n\n`;
        
        if (route.parameters.length > 0) {
          markdown += `#### Parameters\n\n`;
          markdown += `| Name | Type | Required | Description |\n`;
          markdown += `|------|------|----------|-------------|\n`;
          
          route.parameters.forEach(param => {
            markdown += `| ${param.name} | ${param.schema?.type || 'string'} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
          });
          
          markdown += `\n`;
        }
        
        if (route.requestBody) {
          markdown += `#### Request Body\n\n`;
          markdown += `\`\`\`json\n`;
          markdown += `${JSON.stringify(route.requestBody.content['application/json'].schema, null, 2)}\n`;
          markdown += `\`\`\`\n\n`;
        }
        
        if (Object.keys(route.responses).length > 0) {
          markdown += `#### Responses\n\n`;
          
          Object.entries(route.responses).forEach(([statusCode, response]) => {
            markdown += `**${statusCode}** - ${response.description}\n\n`;
          });
          
          markdown += `\n`;
        }
        
        if (route.examples.length > 0) {
          markdown += `#### Examples\n\n`;
          
          route.examples.forEach((example, index) => {
            markdown += `**Example ${index + 1}:**\n\n`;
            markdown += `\`\`\`bash\n`;
            markdown += `curl -X ${route.method} "${this.baseUrl}${route.path}" \\\n`;
            markdown += `  -H "Authorization: Bearer <token>" \\\n`;
            markdown += `  -H "Content-Type: application/json" \\\n`;
            if (example.body) {
              markdown += `  -d '${JSON.stringify(example.body)}'\n`;
            }
            markdown += `\`\`\`\n\n`;
          });
        }
        
        markdown += `---\n\n`;
      });
    });
    
    return markdown;
  }

  /**
   * Generate HTML documentation
   */
  generateHTMLDocs() {
    const openApiSpec = this.generateOpenAPISpec();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.title} Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css">
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        .swagger-ui .topbar {
            display: none;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script>
        SwaggerUIBundle({
            url: 'openapi.json',
            dom_id: '#swagger-ui',
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone
            ],
            layout: "StandaloneLayout",
            deepLinking: true,
            showExtensions: true,
            showCommonExtensions: true
        });
    </script>
</body>
</html>`;
  }

  /**
   * Save documentation files
   */
  async saveDocumentation() {
    try {
      // Generate OpenAPI specification
      const openApiSpec = this.generateOpenAPISpec();
      const openApiPath = path.join(this.outputDir, 'openapi.json');
      fs.writeFileSync(openApiPath, JSON.stringify(openApiSpec, null, 2));
      logger.info(`OpenAPI specification saved to ${openApiPath}`);

      // Generate Markdown documentation
      const markdownDocs = this.generateMarkdownDocs();
      const markdownPath = path.join(this.outputDir, 'README.md');
      fs.writeFileSync(markdownPath, markdownDocs);
      logger.info(`Markdown documentation saved to ${markdownPath}`);

      // Generate HTML documentation
      const htmlDocs = this.generateHTMLDocs();
      const htmlPath = path.join(this.outputDir, 'index.html');
      fs.writeFileSync(htmlPath, htmlDocs);
      logger.info(`HTML documentation saved to ${htmlPath}`);

      // Generate Postman collection
      const postmanCollection = this.generatePostmanCollection();
      const postmanPath = path.join(this.outputDir, 'postman-collection.json');
      fs.writeFileSync(postmanPath, JSON.stringify(postmanCollection, null, 2));
      logger.info(`Postman collection saved to ${postmanPath}`);

      logger.info('API documentation generation completed successfully');
    } catch (error) {
      logger.error('Error saving documentation:', error);
      throw error;
    }
  }

  /**
   * Generate Postman collection
   */
  generatePostmanCollection() {
    const collection = {
      info: {
        name: this.title,
        description: this.description,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [],
      variable: [
        {
          key: 'baseUrl',
          value: this.baseUrl,
          type: 'string'
        },
        {
          key: 'token',
          value: '{{token}}',
          type: 'string'
        }
      ]
    };

    // Group routes by tags
    const groupedRoutes = {};
    this.routes.forEach(route => {
      const tag = route.tags[0] || 'General';
      if (!groupedRoutes[tag]) {
        groupedRoutes[tag] = [];
      }
      groupedRoutes[tag].push(route);
    });

    // Create Postman items
    Object.entries(groupedRoutes).forEach(([tag, routes]) => {
      const folder = {
        name: tag,
        item: []
      };

      routes.forEach(route => {
        const item = {
          name: route.summary || `${route.method} ${route.path}`,
          request: {
            method: route.method,
            header: [
              {
                key: 'Authorization',
                value: 'Bearer {{token}}',
                type: 'text'
              },
              {
                key: 'Content-Type',
                value: 'application/json',
                type: 'text'
              }
            ],
            url: {
              raw: `{{baseUrl}}${route.path}`,
              host: ['{{baseUrl}}'],
              path: route.path.split('/').filter(p => p)
            }
          }
        };

        if (route.requestBody) {
          item.request.body = {
            mode: 'raw',
            raw: JSON.stringify(route.requestBody.content['application/json'].schema, null, 2),
            options: {
              raw: {
                language: 'json'
              }
            }
          };
        }

        folder.item.push(item);
      });

      collection.item.push(folder);
    });

    return collection;
  }

  /**
   * Auto-generate documentation from Express routes
   */
  static fromExpressApp(app, options = {}) {
    const generator = new APIDocumentationGenerator(options);
    
    // Add default security scheme
    generator.addSecurityScheme({
      name: 'bearerAuth',
      definition: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    });

    // Add default tags
    const defaultTags = [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Users', description: 'User management operations' },
      { name: 'Organizations', description: 'Organization management' },
      { name: 'Content', description: 'Content management and publishing' },
      { name: 'Analytics', description: 'Analytics and reporting' },
      { name: 'AI Agents', description: 'AI agent management and execution' },
      { name: 'Integrations', description: 'Third-party integrations' },
      { name: 'Admin', description: 'Administrative operations' }
    ];

    defaultTags.forEach(tag => generator.addTag(tag));

    // Add default schemas
    const defaultSchemas = [
      {
        name: 'User',
        definition: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            role: { type: 'string', enum: ['owner', 'admin', 'manager', 'editor', 'viewer'], example: 'admin' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      },
      {
        name: 'Organization',
        definition: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Acme Corp' },
            description: { type: 'string', example: 'A sample organization' },
            industry: { type: 'string', example: 'Technology' },
            contactEmail: { type: 'string', format: 'email', example: 'contact@acme.com' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    ];

    defaultSchemas.forEach(schema => generator.addSchema(schema));

    return generator;
  }
}

module.exports = APIDocumentationGenerator;


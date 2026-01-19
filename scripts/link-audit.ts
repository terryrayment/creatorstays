import * as fs from 'fs'
import * as path from 'path'

const SRC_DIR = path.join(__dirname, '..', 'src')
const APP_DIR = path.join(SRC_DIR, 'app')

// Collect all valid routes from src/app
function getValidRoutes(dir: string, basePath = ''): Set<string> {
  const routes = new Set<string>()
  
  if (!fs.existsSync(dir)) return routes
  
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue
    
    const fullPath = path.join(dir, entry.name)
    
    if (entry.isDirectory()) {
      // Handle route groups like (docs)
      const isRouteGroup = entry.name.startsWith('(') && entry.name.endsWith(')')
      const routeSegment = isRouteGroup ? '' : `/${entry.name}`
      const newBasePath = basePath + routeSegment
      
      // Check for page.tsx or route.ts in this directory
      const hasPage = fs.existsSync(path.join(fullPath, 'page.tsx'))
      const hasRoute = fs.existsSync(path.join(fullPath, 'route.ts'))
      
      if (hasPage || hasRoute) {
        routes.add(newBasePath || '/')
      }
      
      // Recurse into subdirectories
      const subRoutes = getValidRoutes(fullPath, newBasePath)
      subRoutes.forEach(r => routes.add(r))
    }
  }
  
  // Root page
  if (fs.existsSync(path.join(dir, 'page.tsx'))) {
    routes.add('/')
  }
  
  return routes
}

// Extract dynamic route patterns (e.g., [handle] -> creators/[handle])
function getDynamicPatterns(routes: Set<string>): RegExp[] {
  const patterns: RegExp[] = []
  
  routes.forEach(route => {
    if (route.includes('[')) {
      // Convert /creators/[handle] to /creators/[^/]+
      const pattern = route.replace(/\[[\w-]+\]/g, '[^/]+')
      patterns.push(new RegExp(`^${pattern}$`))
    }
  })
  
  return patterns
}

// Scan files for internal links
function scanForLinks(dir: string): Map<string, string[]> {
  const links = new Map<string, string[]>()
  
  function scan(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.next') {
          scan(fullPath)
        }
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        const fileLinks: string[] = []
        
        // Match <Link href="...">
        const linkRe = /<Link[^>]*href=["']([^"']+)["']/g
        let linkMatch: RegExpExecArray | null
        while ((linkMatch = linkRe.exec(content)) !== null) {
          fileLinks.push(linkMatch[1])
        }
        
        // Match href="/..."
        const hrefRe = /href=["'](\/[^"']+)["']/g
        let hrefMatch: RegExpExecArray | null
        while ((hrefMatch = hrefRe.exec(content)) !== null) {
          fileLinks.push(hrefMatch[1])
        }
        
        // Match router.push("/...")
        const routerRe = /router\.push\(["'](\/[^"']+)["']\)/g
        let routerMatch: RegExpExecArray | null
        while ((routerMatch = routerRe.exec(content)) !== null) {
          fileLinks.push(routerMatch[1])
        }
        
        if (fileLinks.length > 0) {
          links.set(fullPath, fileLinks)
        }
      }
    }
  }
  
  scan(dir)
  return links
}

// Main audit
function audit() {
  console.log('🔍 Auditing internal links...\n')
  
  const validRoutes = getValidRoutes(APP_DIR)
  const dynamicPatterns = getDynamicPatterns(validRoutes)
  
  console.log(`Found ${validRoutes.size} valid routes:`)
  Array.from(validRoutes).sort().forEach(r => console.log(`  ✓ ${r}`))
  console.log('')
  
  const allLinks = scanForLinks(SRC_DIR)
  const brokenLinks: { file: string; link: string }[] = []
  
  allLinks.forEach((links, file) => {
    for (const link of links) {
      // Skip external links
      if (link.startsWith('http') || link.startsWith('mailto:')) continue
      
      // Skip hash-only links
      if (link.startsWith('#')) continue
      
      // Skip template literals with variables
      if (link.includes('${')) continue
      
      // Extract path without hash or query
      const cleanPath = link.split('#')[0].split('?')[0]
      
      // Skip empty paths
      if (!cleanPath || cleanPath === '') continue
      
      // Check if route exists
      const isValid = validRoutes.has(cleanPath) || 
        dynamicPatterns.some(pattern => pattern.test(cleanPath))
      
      if (!isValid) {
        brokenLinks.push({ file: path.relative(SRC_DIR, file), link: cleanPath })
      }
    }
  })
  
  if (brokenLinks.length > 0) {
    console.log('❌ Broken links found:\n')
    brokenLinks.forEach(({ file, link }) => {
      console.log(`  ${file}`)
      console.log(`    → ${link}\n`)
    })
    process.exit(1)
  }
  
  console.log('✅ All internal links are valid!')
  process.exit(0)
}

audit()

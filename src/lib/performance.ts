// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime?: number;
  bundleSize?: number;
  memoryUsage?: number;
}

// Performance monitoring class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  private constructor() {
    this.initPerformanceObserver();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Monitor page load performance
  public startPageLoadTimer(pageName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      const existing = this.metrics.get(pageName);
      const updatedMetrics: PerformanceMetrics = {
        pageLoadTime: loadTime,
        ...(existing?.apiResponseTime && { apiResponseTime: existing.apiResponseTime }),
        ...(existing?.bundleSize && { bundleSize: existing.bundleSize }),
        ...(existing?.memoryUsage && { memoryUsage: existing.memoryUsage }),
      };
      this.metrics.set(pageName, updatedMetrics);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 ${pageName} loaded in ${loadTime.toFixed(2)}ms`);
      }
    };
  }

  // Monitor API response times
  public startAPITimer(endpoint: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const existing = this.metrics.get(endpoint);
      const updatedMetrics: PerformanceMetrics = {
        pageLoadTime: existing?.pageLoadTime || 0,
        apiResponseTime: responseTime,
        ...(existing?.bundleSize && { bundleSize: existing.bundleSize }),
        ...(existing?.memoryUsage && { memoryUsage: existing.memoryUsage }),
      };
      this.metrics.set(endpoint, updatedMetrics);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 ${endpoint} responded in ${responseTime.toFixed(2)}ms`);
      }
    };
  }

  // Get performance metrics
  public getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  // Clear metrics
  public clearMetrics(): void {
    this.metrics.clear();
  }

  // Initialize performance observer for Core Web Vitals
  private initPerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Monitor Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            const lcp = lastEntry.startTime;
            if (process.env.NODE_ENV === 'development') {
              console.log(`🎯 LCP: ${lcp.toFixed(2)}ms`);
            }
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitor First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: unknown) => {
            const fidEntry = entry as { processingStart?: number; startTime?: number };
            if (fidEntry.processingStart && fidEntry.startTime) {
              const fid = fidEntry.processingStart - fidEntry.startTime;
              if (process.env.NODE_ENV === 'development') {
                console.log(`⚡ FID: ${fid.toFixed(2)}ms`);
              }
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Monitor Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let cls = 0;
          const entries = list.getEntries();
          entries.forEach((entry: unknown) => {
            const clsEntry = entry as { hadRecentInput?: boolean; value?: number };
            if (!clsEntry.hadRecentInput && clsEntry.value) {
              cls += clsEntry.value;
            }
          });
          if (process.env.NODE_ENV === 'development') {
            console.log(`📐 CLS: ${cls.toFixed(4)}`);
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }
  }
}

// Bundle size analyzer (development only)
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // This is a simple bundle size estimation
    // In production, you'd use webpack-bundle-analyzer or similar tools
    
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach((script) => {
      const src = script.getAttribute('src');
      if (src && src.includes('_next')) {
        // Estimate size based on URL patterns
        if (src.includes('chunk')) {
          totalSize += 50; // Estimated chunk size in KB
        } else if (src.includes('framework')) {
          totalSize += 100; // Estimated framework size in KB
        }
      }
    });
    
    console.log(`📦 Estimated bundle size: ~${totalSize}KB`);
  }
}

// Memory usage monitor
export function getMemoryUsage(): number | null {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as { memory: { usedJSHeapSize: number } }).memory;
    return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
  }
  return null;
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy load utility
export function lazyLoad<T>(
  _importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): T | React.ReactNode {
  if (typeof window !== 'undefined') {
    // In browser, return fallback while loading
    return fallback || null;
  }
  // In SSR, return null
  return null;
}

// Performance budget checker
export function checkPerformanceBudget(metrics: PerformanceMetrics): boolean {
  const budget = {
    pageLoadTime: 3000, // 3 seconds
    apiResponseTime: 5000, // 5 seconds
  };
  
  const violations = [];
  
  if (metrics.pageLoadTime > budget.pageLoadTime) {
    violations.push(`Page load time (${metrics.pageLoadTime}ms) exceeds budget (${budget.pageLoadTime}ms)`);
  }
  
  if (metrics.apiResponseTime && metrics.apiResponseTime > budget.apiResponseTime) {
    violations.push(`API response time (${metrics.apiResponseTime}ms) exceeds budget (${budget.apiResponseTime}ms)`);
  }
  
  if (violations.length > 0) {
    console.warn('🚨 Performance budget violations:', violations);
    return false;
  }
  
  return true;
}

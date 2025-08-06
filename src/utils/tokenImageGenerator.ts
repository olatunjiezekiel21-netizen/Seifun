// Token Image Generator - Creates unique token images based on token data
export class TokenImageGenerator {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;

  private static initCanvas() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 128;
      this.canvas.height = 128;
      this.ctx = this.canvas.getContext('2d');
    }
  }

  // Generate a unique color palette based on token symbol
  private static generateColorPalette(symbol: string): { primary: string; secondary: string; accent: string } {
    const palettes = [
      { primary: '#3B82F6', secondary: '#8B5CF6', accent: '#F59E0B' }, // Blue-Purple-Amber
      { primary: '#10B981', secondary: '#059669', accent: '#F97316' }, // Emerald-Green-Orange
      { primary: '#8B5CF6', secondary: '#EC4899', accent: '#06B6D4' }, // Purple-Pink-Cyan
      { primary: '#F59E0B', secondary: '#EF4444', accent: '#8B5CF6' }, // Amber-Red-Purple
      { primary: '#06B6D4', secondary: '#3B82F6', accent: '#10B981' }, // Cyan-Blue-Emerald
      { primary: '#6366F1', secondary: '#8B5CF6', accent: '#F97316' }, // Indigo-Purple-Orange
      { primary: '#EC4899', secondary: '#F43F5E', accent: '#06B6D4' }, // Pink-Rose-Cyan
      { primary: '#14B8A6', secondary: '#10B981', accent: '#F59E0B' }, // Teal-Emerald-Amber
      { primary: '#EAB308', secondary: '#F59E0B', accent: '#8B5CF6' }, // Yellow-Amber-Purple
      { primary: '#7C3AED', secondary: '#8B5CF6', accent: '#EC4899' }  // Violet-Purple-Pink
    ];

    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return palettes[hash % palettes.length];
  }

  // Generate geometric patterns
  private static drawGeometricPattern(
    ctx: CanvasRenderingContext2D,
    symbol: string,
    colors: { primary: string; secondary: string; accent: string }
  ) {
    const size = 128;
    const centerX = size / 2;
    const centerY = size / 2;

    // Create gradient background
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size / 2);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(1, colors.secondary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Generate pattern based on symbol
    const patternType = symbol.charCodeAt(0) % 4;

    switch (patternType) {
      case 0: // Circles
        this.drawCirclePattern(ctx, colors, size);
        break;
      case 1: // Triangles
        this.drawTrianglePattern(ctx, colors, size);
        break;
      case 2: // Hexagons
        this.drawHexagonPattern(ctx, colors, size);
        break;
      case 3: // Diamonds
        this.drawDiamondPattern(ctx, colors, size);
        break;
    }

    // Add symbol text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol.charAt(0).toUpperCase(), centerX, centerY);
  }

  private static drawCirclePattern(
    ctx: CanvasRenderingContext2D,
    colors: { primary: string; secondary: string; accent: string },
    size: number
  ) {
    ctx.fillStyle = colors.accent + '40';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = size / 2 + Math.cos(angle) * 30;
      const y = size / 2 + Math.sin(angle) * 30;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private static drawTrianglePattern(
    ctx: CanvasRenderingContext2D,
    colors: { primary: string; secondary: string; accent: string },
    size: number
  ) {
    ctx.fillStyle = colors.accent + '30';
    const triangles = [
      { x: size / 4, y: size / 4 },
      { x: (size * 3) / 4, y: size / 4 },
      { x: size / 4, y: (size * 3) / 4 },
      { x: (size * 3) / 4, y: (size * 3) / 4 }
    ];

    triangles.forEach(triangle => {
      ctx.beginPath();
      ctx.moveTo(triangle.x, triangle.y - 10);
      ctx.lineTo(triangle.x - 8, triangle.y + 5);
      ctx.lineTo(triangle.x + 8, triangle.y + 5);
      ctx.closePath();
      ctx.fill();
    });
  }

  private static drawHexagonPattern(
    ctx: CanvasRenderingContext2D,
    colors: { primary: string; secondary: string; accent: string },
    size: number
  ) {
    ctx.strokeStyle = colors.accent + '50';
    ctx.lineWidth = 2;
    
    const hexSize = 15;
    const centerX = size / 2;
    const centerY = size / 2;
    
    for (let ring = 1; ring <= 2; ring++) {
      const radius = hexSize * ring * 1.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  private static drawDiamondPattern(
    ctx: CanvasRenderingContext2D,
    colors: { primary: string; secondary: string; accent: string },
    size: number
  ) {
    ctx.fillStyle = colors.accent + '25';
    const diamonds = [
      { x: size / 2, y: 20 },
      { x: 20, y: size / 2 },
      { x: size - 20, y: size / 2 },
      { x: size / 2, y: size - 20 }
    ];

    diamonds.forEach(diamond => {
      ctx.beginPath();
      ctx.moveTo(diamond.x, diamond.y - 8);
      ctx.lineTo(diamond.x + 8, diamond.y);
      ctx.lineTo(diamond.x, diamond.y + 8);
      ctx.lineTo(diamond.x - 8, diamond.y);
      ctx.closePath();
      ctx.fill();
    });
  }

  // Generate token image as data URL
  public static generateTokenImage(symbol: string, name: string): string {
    this.initCanvas();
    
    if (!this.ctx || !this.canvas) {
      throw new Error('Canvas not initialized');
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, 128, 128);

    // Generate colors and pattern
    const colors = this.generateColorPalette(symbol);
    this.drawGeometricPattern(this.ctx, symbol, colors);

    // Return as data URL
    return this.canvas.toDataURL('image/png');
  }

  // Generate SVG token image (lighter weight alternative)
  public static generateSVGTokenImage(symbol: string, name: string): string {
    const colors = this.generateColorPalette(symbol);
    const patternType = symbol.charCodeAt(0) % 4;
    
    let pattern = '';
    switch (patternType) {
      case 0: // Circles
        pattern = `
          <circle cx="32" cy="32" r="6" fill="${colors.accent}40"/>
          <circle cx="96" cy="32" r="6" fill="${colors.accent}40"/>
          <circle cx="32" cy="96" r="6" fill="${colors.accent}40"/>
          <circle cx="96" cy="96" r="6" fill="${colors.accent}40"/>
        `;
        break;
      case 1: // Triangles
        pattern = `
          <polygon points="32,22 24,37 40,37" fill="${colors.accent}30"/>
          <polygon points="96,22 88,37 104,37" fill="${colors.accent}30"/>
          <polygon points="32,91 24,106 40,106" fill="${colors.accent}30"/>
          <polygon points="96,91 88,106 104,106" fill="${colors.accent}30"/>
        `;
        break;
      case 2: // Hexagons
        pattern = `
          <polygon points="64,20 84,32 84,52 64,64 44,52 44,32" fill="none" stroke="${colors.accent}50" stroke-width="2"/>
          <polygon points="64,35 74,42 74,52 64,59 54,52 54,42" fill="none" stroke="${colors.accent}30" stroke-width="1"/>
        `;
        break;
      case 3: // Diamonds
        pattern = `
          <polygon points="64,20 72,28 64,36 56,28" fill="${colors.accent}25"/>
          <polygon points="20,64 28,56 36,64 28,72" fill="${colors.accent}25"/>
          <polygon points="108,64 100,56 92,64 100,72" fill="${colors.accent}25"/>
          <polygon points="64,108 72,100 64,92 56,100" fill="${colors.accent}25"/>
        `;
        break;
    }

    const svg = `
      <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="tokenGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
          </radialGradient>
        </defs>
        <rect width="128" height="128" fill="url(#tokenGrad)" rx="64"/>
        ${pattern}
        <text x="64" y="72" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">
          ${symbol.charAt(0).toUpperCase()}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}

// Hook to generate token image
export const useTokenImage = (symbol: string, name: string, customImage?: string) => {
  if (customImage) return customImage;
  
  try {
    return TokenImageGenerator.generateSVGTokenImage(symbol, name);
  } catch (error) {
    console.error('Failed to generate token image:', error);
    return null;
  }
};
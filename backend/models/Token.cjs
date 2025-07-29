const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  address: { 
    type: String, 
    unique: true, 
    required: true,
    index: true 
  },
  
  // Basic token information
  basicInfo: {
    name: String,
    symbol: String,
    decimals: String,
    totalSupply: String
  },
  
  // Safety analysis results
  analysis: {
    riskScore: { type: Number, min: 0, max: 100 },
    isSafe: Boolean,
    riskFactors: [String],
    safetyChecks: {
      supply: {
        passed: Boolean,
        totalSupply: String,
        risk: String,
        error: String
      },
      ownership: {
        passed: Boolean,
        owner: String,
        isOwnershipRenounced: Boolean,
        risk: String,
        error: String
      },
      liquidity: {
        passed: Boolean,
        liquidity: String,
        risk: String,
        error: String
      },
      honeypot: {
        passed: Boolean,
        isHoneypot: Boolean,
        risk: String,
        error: String
      },
      blacklist: {
        passed: Boolean,
        hasBlacklist: Boolean,
        risk: String,
        error: String
      },
      verified: {
        passed: Boolean,
        verified: Boolean,
        risk: String,
        error: String
      },
      transfer: {
        passed: Boolean,
        hasTransfer: Boolean,
        hasTransferFrom: Boolean,
        risk: String,
        error: String
      },
      fees: {
        passed: Boolean,
        hasExcessiveFees: Boolean,
        risk: String,
        error: String
      }
    }
  },
  
  // Checker contract information
  checkerAddress: String,
  initialTotalSupply: String,
  lastCheckedSupply: String,
  
  // Tracking information
  lastScanned: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  scanCount: { 
    type: Number, 
    default: 0 
  },
  firstScanned: { 
    type: Date, 
    default: Date.now 
  },
  
  // Status flags
  suspicious: { 
    type: Boolean, 
    default: false 
  },
  flagged: { 
    type: Boolean, 
    default: false 
  },
  
  // Community data
  communityScore: { 
    type: Number, 
    default: 0 
  },
  reportCount: { 
    type: Number, 
    default: 0 
  },
  
  // Metadata
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
TokenSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for better query performance
TokenSchema.index({ "analysis.riskScore": -1 });
TokenSchema.index({ "analysis.isSafe": 1 });
TokenSchema.index({ suspicious: 1 });
TokenSchema.index({ flagged: 1 });
TokenSchema.index({ "basicInfo.symbol": 1 });

// Virtual for formatted total supply
TokenSchema.virtual('formattedTotalSupply').get(function() {
  if (!this.basicInfo.totalSupply) return '0';
  
  const supply = BigInt(this.basicInfo.totalSupply);
  const decimals = parseInt(this.basicInfo.decimals || '18');
  
  // Format with commas and appropriate decimal places
  const formatted = (supply / BigInt(10 ** decimals)).toString();
  return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
});

// Virtual for safety status
TokenSchema.virtual('safetyStatus').get(function() {
  if (!this.analysis.riskScore) return 'unknown';
  
  if (this.analysis.riskScore >= 80) return 'safe';
  if (this.analysis.riskScore >= 60) return 'warning';
  return 'danger';
});

// Static method to get statistics
TokenSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalTokens: { $sum: 1 },
        safeTokens: { 
          $sum: { $cond: [{ $eq: ["$analysis.isSafe", true] }, 1, 0] } 
        },
        avgRiskScore: { $avg: "$analysis.riskScore" },
        totalScans: { $sum: "$scanCount" }
      }
    }
  ]);
  
  return stats[0] || {
    totalTokens: 0,
    safeTokens: 0,
    avgRiskScore: 0,
    totalScans: 0
  };
};

// Static method to get recent scans
TokenSchema.statics.getRecentScans = async function(limit = 20) {
  return this.find()
    .sort({ lastScanned: -1 })
    .limit(limit)
    .select('address basicInfo analysis lastScanned scanCount');
};

// Static method to get safe tokens
TokenSchema.statics.getSafeTokens = async function(limit = 50) {
  return this.find({ "analysis.isSafe": true })
    .sort({ "analysis.riskScore": -1 })
    .limit(limit)
    .select('address basicInfo analysis communityScore');
};

// Static method to get suspicious tokens
TokenSchema.statics.getSuspiciousTokens = async function(limit = 50) {
  return this.find({ 
    $or: [
      { suspicious: true },
      { "analysis.riskScore": { $lt: 50 } }
    ]
  })
    .sort({ "analysis.riskScore": 1 })
    .limit(limit)
    .select('address basicInfo analysis reportCount');
};

module.exports = mongoose.model("Token", TokenSchema);

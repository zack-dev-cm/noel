export class UsageTracker {
  private totalTokens = 0;
  private totalCost = 0;
  private totalRequests = 0;

  constructor(
    private softTokenLimit: number,
    private hardTokenLimit: number,
    private softCostLimit: number,
    private hardCostLimit: number,
    private costPer1kTokens: number,
    private softRequestLimit = 0,
    private hardRequestLimit = 0
  ) {}

  private evaluate() {
    const overSoftTokens = this.softTokenLimit > 0 && this.totalTokens >= this.softTokenLimit;
    const overHardTokens = this.hardTokenLimit > 0 && this.totalTokens >= this.hardTokenLimit;
    const overSoftCost = this.softCostLimit > 0 && this.totalCost >= this.softCostLimit;
    const overHardCost = this.hardCostLimit > 0 && this.totalCost >= this.hardCostLimit;
    const overSoftRequests = this.softRequestLimit > 0 && this.totalRequests >= this.softRequestLimit;
    const overHardRequests = this.hardRequestLimit > 0 && this.totalRequests >= this.hardRequestLimit;

    return {
      totalTokens: this.totalTokens,
      totalCost: Number(this.totalCost.toFixed(4)),
      totalRequests: this.totalRequests,
      overSoft: overSoftTokens || overSoftCost || overSoftRequests,
      overHard: overHardTokens || overHardCost || overHardRequests
    };
  }

  updateLimits(options: {
    softTokenLimit: number;
    hardTokenLimit: number;
    softCostLimit: number;
    hardCostLimit: number;
    costPer1kTokens: number;
    softRequestLimit?: number;
    hardRequestLimit?: number;
  }) {
    this.softTokenLimit = options.softTokenLimit;
    this.hardTokenLimit = options.hardTokenLimit;
    this.softCostLimit = options.softCostLimit;
    this.hardCostLimit = options.hardCostLimit;
    this.costPer1kTokens = options.costPer1kTokens;
    this.softRequestLimit = options.softRequestLimit ?? this.softRequestLimit;
    this.hardRequestLimit = options.hardRequestLimit ?? this.hardRequestLimit;
  }

  snapshot() {
    return this.evaluate();
  }

  record(tokensUsed: number, requestCount = 1) {
    this.totalTokens += tokensUsed;
    if (this.costPer1kTokens > 0) {
      this.totalCost += (tokensUsed / 1000) * this.costPer1kTokens;
    }
    if (requestCount > 0) {
      this.totalRequests += requestCount;
    }

    return this.evaluate();
  }

  get tokens() {
    return this.totalTokens;
  }

  get cost() {
    return Number(this.totalCost.toFixed(4));
  }

  get requests() {
    return this.totalRequests;
  }
}

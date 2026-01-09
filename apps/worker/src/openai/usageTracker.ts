export class UsageTracker {
  private totalTokens = 0;
  private totalCost = 0;

  constructor(
    private softTokenLimit: number,
    private hardTokenLimit: number,
    private softCostLimit: number,
    private hardCostLimit: number,
    private costPer1kTokens: number
  ) {}

  record(tokensUsed: number) {
    this.totalTokens += tokensUsed;
    if (this.costPer1kTokens > 0) {
      this.totalCost += (tokensUsed / 1000) * this.costPer1kTokens;
    }

    const overSoftTokens = this.softTokenLimit > 0 && this.totalTokens >= this.softTokenLimit;
    const overHardTokens = this.hardTokenLimit > 0 && this.totalTokens >= this.hardTokenLimit;
    const overSoftCost = this.softCostLimit > 0 && this.totalCost >= this.softCostLimit;
    const overHardCost = this.hardCostLimit > 0 && this.totalCost >= this.hardCostLimit;

    return {
      totalTokens: this.totalTokens,
      totalCost: Number(this.totalCost.toFixed(4)),
      overSoft: overSoftTokens || overSoftCost,
      overHard: overHardTokens || overHardCost
    };
  }

  get tokens() {
    return this.totalTokens;
  }

  get cost() {
    return Number(this.totalCost.toFixed(4));
  }
}

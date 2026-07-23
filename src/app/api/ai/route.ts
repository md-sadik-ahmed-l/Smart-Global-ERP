import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { requireAuth, unauthorized } from "@/lib/api-helpers";
import { db } from "@/lib/db";

// POST /api/ai/forecast — Real AI sales forecasting
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const { type = "sales_forecast" } = body;
    const tenantId = (session.user as any).tenantId;

    // Gather real historical data
    const historicalSales = await db.salesOrder.findMany({
      where: { tenantId },
      select: { totalAmount: true, orderDate: true, status: true },
      orderBy: { orderDate: "asc" },
      take: 100,
    });

    const totalRevenue = historicalSales.reduce((s, o) => s + o.totalAmount, 0);
    const avgOrderValue = historicalSales.length > 0 ? totalRevenue / historicalSales.length : 0;
    const completedOrders = historicalSales.filter((o) => o.status === "COMPLETED").length;
    const completionRate = historicalSales.length > 0 ? (completedOrders / historicalSales.length) * 100 : 0;

    // Get inventory & customer stats
    const [totalProducts, lowStockProducts, totalCustomers, totalVendors] = await Promise.all([
      db.product.count({ where: { tenantId } }),
      db.product.count({ where: { tenantId, stockItems: { some: { quantity: { lt: 10 } } } } }),
      db.customer.count({ where: { tenantId } }),
      db.vendor.count({ where: { tenantId } }),
    ]);

    // Use real AI (z-ai-web-dev-sdk) to generate forecast
    const zai = await ZAI.create();
    const prompt = `You are an enterprise ERP business analyst AI. Based on the following REAL business data from Smart Global ERP, generate a comprehensive business forecast and insights.

REAL DATA:
- Total Revenue (historical): ৳${totalRevenue.toLocaleString()}
- Total Orders: ${historicalSales.length}
- Average Order Value: ৳${avgOrderValue.toFixed(2)}
- Order Completion Rate: ${completionRate.toFixed(1)}%
- Total Products: ${totalProducts}
- Low Stock Products: ${lowStockProducts}
- Total Customers: ${totalCustomers}
- Total Vendors: ${totalVendors}

REQUEST TYPE: ${type}

Generate a JSON response with this exact structure:
{
  "forecast": {
    "nextMonthRevenue": <number>,
    "nextQuarterRevenue": <number>,
    "growthRate": <number>,
    "confidence": <number 0-100>
  },
  "insights": [
    { "type": "positive|warning|critical|opportunity", "title": "<string>", "description": "<string>", "impact": "high|medium|low" }
  ],
  "recommendations": [
    { "priority": "high|medium|low", "action": "<string>", "expectedImpact": "<string>" }
  ],
  "riskAssessment": {
    "overallRisk": "low|medium|high",
    "factors": [{ "factor": "<string>", "severity": "low|medium|high", "mitigation": "<string>" }]
  },
  "kpiPredictions": {
    "revenueTrend": "up|down|stable",
    "inventoryHealth": "good|moderate|critical",
    "customerGrowth": "up|down|stable",
    "cashFlowHealth": "positive|neutral|negative"
  }
}

Be specific, data-driven, and provide actionable insights for an enterprise CEO. All amounts in BDT.`;

    const response = await zai.chat.completions.create({
      messages: [
        { role: "system", content: "You are an enterprise business intelligence AI assistant. Always respond with valid JSON only, no markdown." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "{}";
    let parsed;
    try {
      // Strip any markdown code fences
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { rawResponse: content, forecast: null, insights: [], recommendations: [] };
    }

    return NextResponse.json({
      success: true,
      type,
      data: parsed,
      meta: {
        historicalDataPoints: historicalSales.length,
        totalRevenue,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (e: any) {
    console.error("AI forecast error:", e);
    return NextResponse.json(
      { error: "Failed to generate AI forecast", details: e.message },
      { status: 500 }
    );
  }
}

// GET /api/ai/forecast — Quick AI business insights
export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const tenantId = (session.user as any).tenantId;
  const [revenue, orders, products, customers] = await Promise.all([
    db.salesOrder.aggregate({ where: { tenantId }, _sum: { totalAmount: true } }),
    db.salesOrder.count({ where: { tenantId } }),
    db.product.count({ where: { tenantId } }),
    db.customer.count({ where: { tenantId } }),
  ]);

  return NextResponse.json({
    quickStats: {
      revenue: revenue._sum.totalAmount || 0,
      orders,
      products,
      customers,
    },
    message: "Use POST /api/ai with type=sales_forecast|demand_prediction|financial_analysis for full AI insights",
  });
}

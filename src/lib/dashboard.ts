import "server-only";
import { connectDb } from "./db";
import { dayKey } from "./format";
import { Order } from "./models";
import { ORDER_STATUSES, type OrderStatus } from "./order-status";

const DAY = 86_400_000;
const PERIOD_DAYS = 30;

export type DayPoint = { day: string; value: number };

export async function getDashboard() {
  await connectDb();
  const now = Date.now();
  const days = Array.from({ length: PERIOD_DAYS }, (_, index) =>
    dayKey(new Date(now - (PERIOD_DAYS - 1 - index) * DAY)),
  );
  const firstDay = days[0];

  const [orders, statusRows, recent] = await Promise.all([
    Order.find(
      { createdAt: { $gte: new Date(now - 2 * (PERIOD_DAYS + 1) * DAY) }, status: { $ne: "annulee" } },
      { total: 1, createdAt: 1, items: 1 },
    ).lean(),
    Order.aggregate<{ _id: OrderStatus; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Order.find({}, { number: 1, customerName: 1, city: 1, total: 1, status: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const byDay = new Map(days.map((day) => [day, 0]));
  const byProduct = new Map<string, { quantity: number; revenue: number }>();
  let revenue = 0;
  let count = 0;
  let previousRevenue = 0;
  const previousFirstDay = dayKey(new Date(now - (2 * PERIOD_DAYS - 1) * DAY));

  for (const order of orders) {
    const day = dayKey(order.createdAt);
    if (day >= firstDay) {
      revenue += order.total;
      count += 1;
      byDay.set(day, (byDay.get(day) ?? 0) + order.total);
      for (const item of order.items) {
        const entry = byProduct.get(item.productName) ?? { quantity: 0, revenue: 0 };
        entry.quantity += item.quantity;
        entry.revenue += item.unitPrice * item.quantity;
        byProduct.set(item.productName, entry);
      }
    } else if (day >= previousFirstDay) {
      previousRevenue += order.total;
    }
  }

  const statusCounts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<
    OrderStatus,
    number
  >;
  for (const row of statusRows) statusCounts[row._id] = row.count;

  return {
    revenue,
    count,
    average: count ? Math.round(revenue / count) : 0,
    change: previousRevenue ? (revenue - previousRevenue) / previousRevenue : null,
    series: days.map((day): DayPoint => ({ day, value: byDay.get(day) ?? 0 })),
    topProducts: [...byProduct.entries()]
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    statusCounts,
    recent,
  };
}

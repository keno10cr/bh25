import { NextResponse } from "next/server";
import { createSanityServerClient } from "@/lib/sanity/client";
import { isToolRequestAuthorized } from "@/lib/toolAuth";

const QUOTE_NUMBER = /^BHGR\d{6,12}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const text = (value, max = 200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
};
const date = (value) => (typeof value === "string" && ISO_DATE.test(value) ? value : null);
const list = (value, max = 40) => (Array.isArray(value) ? value.slice(0, max) : []);

function withoutEmpty(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== null && value !== "")
  );
}

function buildFields(body) {
  return withoutEmpty({
    quoteNumber: body.quoteNumber,
    groupName: text(body.groupName),
    contactName: text(body.contactName),
    checkIn: date(body.checkIn),
    checkOut: date(body.checkOut),
    nights: num(body.nights),
    totalGuests: num(body.totalGuests),
    validUntil: date(body.validUntil),
    quoteNotes: text(body.quoteNotes, 2000),
    villas: list(body.villas).map((villa, index) =>
      withoutEmpty({
        _key: `villa${index}`,
        _type: "quotedVilla",
        name: text(villa?.name),
        guests: num(villa?.guests),
        checkIn: date(villa?.checkIn),
        checkOut: date(villa?.checkOut),
        nights: num(villa?.nights),
        subtotal: num(villa?.subtotal),
        exceptions: list(villa?.exceptions, 10).map((item) => text(item, 300)).filter(Boolean),
      })
    ),
    total: num(body.total),
    subtotal: num(body.subtotal),
    stayDiscounts: list(body.stayDiscounts, 4).map((line, index) =>
      withoutEmpty({
        _key: `stay${index}`,
        _type: "quotedStayDiscount",
        title: text(line?.title),
        amount: num(line?.amount),
      })
    ),
    discountLabel: text(body.discountLabel),
    discountAmount: num(body.discountAmount),
    addOnsTotal: num(body.addOnsTotal),
    addOns: list(body.addOns).map((item, index) =>
      withoutEmpty({
        _key: `addon${index}`,
        _type: "quotedAddOn",
        name: text(item?.name),
        category: text(item?.category, 20),
        unitPriceUsd: num(item?.unitPriceUsd),
        people: num(item?.people),
        units: num(item?.units),
        total: num(item?.total),
      })
    ),
    fees: list(body.fees, 10).map((fee, index) =>
      withoutEmpty({
        _key: `fee${index}`,
        _type: "quotedFee",
        title: text(fee?.title),
        amount: num(fee?.amount),
      })
    ),
    taxRate: num(body.taxRate),
    taxes: num(body.taxes),
    language: text(body.language, 5),
    currency: text(body.currency, 5),
    exchangeRate: num(body.exchangeRate),
    phone: text(body.phone, 40),
    priceDisplay: text(body.priceDisplay, 20),
    rateDetail: text(body.rateDetail, 20),
  });
}

export async function POST(request) {
  if (!(await isToolRequestAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  if (!QUOTE_NUMBER.test(body?.quoteNumber || "")) {
    return NextResponse.json({ error: "Invalid quote number." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const id = `groupQuote-${body.quoteNumber}`;
  const fields = buildFields(body);
  for (const key of ["villas", "addOns", "fees", "stayDiscounts"]) {
    if (!fields[key]?.length) fields[key] = [];
  }

  try {
    await createSanityServerClient()
      .transaction()
      .createIfNotExists({
        _id: id,
        _type: "groupQuote",
        status: "sent",
        createdAt: now,
        downloads: 0,
      })
      .patch(id, (patch) =>
        patch
          .set({ ...fields, lastDownloadedAt: now })
          .unset(["discountLabel", "exchangeRate"].filter((key) => !(key in fields)))
          .inc({ downloads: 1 })
      )
      .commit();
  } catch (error) {
    console.error("Group quote log failed:", error);
    return NextResponse.json({ error: "Could not save the quote log." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id });
}

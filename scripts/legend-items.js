export const LEGEND_ITEMS = [
  {
    _id: "legendItem-beaches",
    title: "Beaches",
    slug: "beaches",
    color: "#2e86ab",
    sortOrder: 1,
  },
  {
    _id: "legendItem-blessed-house",
    title: "Blessed House",
    slug: "blessed-house",
    color: "#0a4c3a",
    sortOrder: 2,
  },
  {
    _id: "legendItem-waterfalls",
    title: "Waterfalls",
    slug: "waterfalls",
    color: "#3d8b6e",
    sortOrder: 3,
  },
  {
    _id: "legendItem-tours",
    title: "Tours",
    slug: "tours",
    color: "#e8a838",
    sortOrder: 4,
  },
];

export const CATEGORY_TO_LEGEND_ID = {
  Beaches: "legendItem-beaches",
  "Blessed House": "legendItem-blessed-house",
  Waterfalls: "legendItem-waterfalls",
  Tours: "legendItem-tours",
};

export function legendRefsForCategory(category) {
  const id = CATEGORY_TO_LEGEND_ID[category] || "legendItem-blessed-house";
  return [{ _type: "reference", _ref: id, _key: id }];
}

export function legendDocument(item) {
  return {
    _id: item._id,
    _type: "legendItem",
    title: item.title,
    slug: { _type: "slug", current: item.slug },
    color: item.color,
    sortOrder: item.sortOrder,
  };
}

import { defineArrayMember, defineField, defineType } from "sanity";
import { BLOG_CATEGORIES } from "./blog";
import { isUniqueBlogSlug, slugifyBlogTitle } from "../lib/blogSlug";
import { isResizedFamilyPhotoRef } from "../lib/familyPhoto";
import {
  FamilyGalleryInput,
  FamilyPhotoInput,
} from "../components/FamilyPhotoInputs";

const NOT_RESIZED_MESSAGE =
  "This photo was not resized. Remove it and add it again with the Choose photo or Add photos button, so it is saved at the right size.";

function checkResizedPhoto(value) {
  if (!value?.asset?._ref) return true;
  return isResizedFamilyPhotoRef(value.asset._ref) || NOT_RESIZED_MESSAGE;
}

function countParagraphs(blocks) {
  return (Array.isArray(blocks) ? blocks : []).filter(
    (block) =>
      block?._type === "block" &&
      (block.children || []).some((child) => String(child?.text || "").trim())
  ).length;
}

const photoAltField = defineField({
  name: "alt",
  title: "Alt text (describe the photo)",
  type: "string",
  description:
    "One short sentence that describes what is in the photo. It helps blind visitors and Google. Example: Tide pools at sunrise in Cahuita National Park.",
});

export const familyBlog = defineType({
  name: "familyBlog",
  title: "Family Blog post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description:
        "The name of the post that visitors see at the top of the page. Keep it short and clear. No need to add the date, the site shows it automatically. Example: Sunrise and tide pools in Cahuita",
      validation: (Rule) => [
        Rule.required().error("Please write a title."),
        Rule.max(80).warning("Shorter titles look better. Try to keep it under 80 characters."),
      ],
    }),
    defineField({
      name: "slug",
      title: "Slug (page address)",
      type: "slug",
      description:
        "This is the address of the page after blessedhouse.info/blog/. Click Generate to create it from the title, or type your own. It converts automatically: amanecer y Piscinas Cahuita Daniel becomes amanecer-y-piscinas-cahuita-daniel. Tips: keep it short (3 to 6 words), no special characters (accents, ñ, ?, !, #), and no date, since the date is already saved in the post.",
      options: {
        source: "title",
        maxLength: 96,
        slugify: slugifyBlogTitle,
        isUnique: isUniqueBlogSlug,
      },
      validation: (Rule) =>
        Rule.required().error("Click Generate to create the page address."),
    }),
    defineField({
      name: "publishedAt",
      title: "Post date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      description:
        "Filled in automatically with today. This date is saved and displayed on the post page, so you do not need to write it in the title or in the content. If you pick a future date, the post stays hidden until that day.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: "Pick one that relates to the post you are about to create.",
      options: { list: BLOG_CATEGORIES, layout: "dropdown" },
      validation: (Rule) => Rule.required().error("Please pick a category."),
    }),
    defineField({
      name: "featuredImage",
      title: "Main photo",
      type: "image",
      description:
        "The big photo at the top of the post and on the blog list. Pick the shape first, then choose the photo. The site crops it from the center and saves it as a light JPG.",
      options: { hotspot: true },
      components: { input: FamilyPhotoInput },
      fields: [photoAltField],
      validation: (Rule) =>
        Rule.required()
          .error("Please add a main photo.")
          .custom(checkResizedPhoto),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt (short hook)",
      type: "text",
      rows: 3,
      description:
        "The hook: one or two short sentences that make people want to read the post. It shows under the title on the blog list, on Google, and as the caption when the post is shared on social media. Maximum 160 characters. Example: The tide pools in Cahuita glow at sunrise, and we had them all to ourselves.",
      validation: (Rule) => [
        Rule.required().error("Please write a short hook."),
        Rule.max(160).error("Keep the hook to 160 characters or fewer."),
      ],
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      description:
        "The story of the post. Write 3 to 5 short paragraphs (at least 1). Press Enter to start a new paragraph. Tell what you saw, where it was, and any tips for guests. No need to write the date here, it is shown automatically. Add your photos below in More photos.",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Small heading", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullets", value: "bullet" },
            { title: "Numbers", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (Rule) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  },
                ],
              },
            ],
          },
        }),
      ],
      validation: (Rule) => [
        Rule.custom((value) =>
          countParagraphs(value) >= 1 ? true : "Please write at least 1 paragraph."
        ),
        Rule.custom((value) => {
          const count = countParagraphs(value);
          return count === 0 || count >= 3
            ? true
            : "Tip: 3 to 5 paragraphs make the best posts. You can still publish with fewer.";
        }).warning(),
      ],
    }),
    defineField({
      name: "gallery",
      title: "More photos",
      type: "array",
      description:
        "Extra photos shown at the end of the post. Pick the shape, then click Add photos (you can choose several at once). Every photo is resized and saved as JPG automatically. Drag to change the order.",
      options: { layout: "grid" },
      components: { input: FamilyGalleryInput },
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          components: { input: FamilyPhotoInput },
          fields: [photoAltField],
          validation: (Rule) => Rule.custom(checkResizedPhoto),
        }),
      ],
    }),
    defineField({
      name: "publishMode",
      title: "Repost using Make.com",
      type: "string",
      description:
        "Required. Choose where this post goes when you click Publish. Just our blog: it only appears on blessedhouse.info/blog. Blog and automated social posts: it also goes to Make.com, which creates the social media posts automatically. This choice only counts the first time you publish.",
      options: {
        list: [
          { title: "Just our blog", value: "blogOnly" },
          {
            title: "Blog and automated social posts (Make.com)",
            value: "makeRepost",
          },
        ],
        layout: "radio",
      },
      validation: (Rule) =>
        Rule.required().error("Please choose where this post goes."),
    }),
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      publishedAt: "publishedAt",
      publishMode: "publishMode",
      media: "featuredImage",
    },
    prepare({ title, category, publishedAt, publishMode, media }) {
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : "";
      const social = publishMode === "makeRepost" ? "Make.com" : "";
      return {
        title,
        subtitle: [category, date, social].filter(Boolean).join(" · "),
        media,
      };
    },
  },
  orderings: [
    {
      title: "Post date, newest",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});

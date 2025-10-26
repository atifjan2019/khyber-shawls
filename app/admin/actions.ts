"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Product Actions
export async function getProducts() {
  try {
    const products = await db.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

export async function getProductById(id: string) {
  try {
    const product = await db.product.findUnique({
      where: { id },
    });
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
}

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const image = formData.get("image") as string;
    const category = formData.get("category") as string;
    const inStock = formData.get("inStock") === "true";

    await db.product.create({
      data: {
        name,
        description,
        price,
        image,
        category,
        inStock,
      },
    });

    revalidatePath("/admin/products");
    redirect("/admin/products");
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const image = formData.get("image") as string;
    const category = formData.get("category") as string;
    const inStock = formData.get("inStock") === "true";

    await db.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        image,
        category,
        inStock,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    redirect("/admin/products");
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product");
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product");
  }
}

// Order Actions
export async function getOrders() {
  try {
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

export async function getOrderById(id: string) {
  try {
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw new Error("Failed to fetch order");
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    await db.order.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error("Failed to update order status");
  }
}

export async function deleteOrder(id: string) {
  try {
    // Delete order items first
    await db.orderItem.deleteMany({
      where: { orderId: id },
    });

    // Then delete the order
    await db.order.delete({
      where: { id },
    });

    revalidatePath("/admin/orders");
  } catch (error) {
    console.error("Error deleting order:", error);
    throw new Error("Failed to delete order");
  }
}

// Customer Actions
export async function getCustomers() {
  try {
    const customers = await db.customer.findMany({
      include: {
        orders: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return customers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
}

export async function getCustomerById(id: string) {
  try {
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
    return customer;
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw new Error("Failed to fetch customer");
  }
}

export async function deleteCustomer(id: string) {
  try {
    await db.customer.delete({
      where: { id },
    });

    revalidatePath("/admin/customers");
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw new Error("Failed to delete customer");
  }
}

// Blog Post Actions
export async function getBlogPosts() {
  try {
    const posts = await db.blogPost.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return posts;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    throw new Error("Failed to fetch blog posts");
  }
}

export async function getBlogPostById(id: string) {
  try {
    const post = await db.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return post;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    throw new Error("Failed to fetch blog post");
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return post;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    throw new Error("Failed to fetch blog post");
  }
}

export async function createBlogPost(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const image = formData.get("image") as string;
    const published = formData.get("published") === "true";
    const authorId = formData.get("authorId") as string | null;

    await db.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        image,
        published,
        ...(authorId && { authorId }),
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    redirect("/admin/blog");
  } catch (error) {
    console.error("Error creating blog post:", error);
    throw new Error("Failed to create blog post");
  }
}

export async function updateBlogPost(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const image = formData.get("image") as string;
    const published = formData.get("published") === "true";
    const authorId = formData.get("authorId") as string | null;

    await db.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt,
        image,
        published,
        ...(authorId && { authorId }),
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${id}`);
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    redirect("/admin/blog");
  } catch (error) {
    console.error("Error updating blog post:", error);
    throw new Error("Failed to update blog post");
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await db.blogPost.delete({
      where: { id },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
  } catch (error) {
    console.error("Error deleting blog post:", error);
    throw new Error("Failed to delete blog post");
  }
}

export async function toggleBlogPostPublished(id: string, published: boolean) {
  try {
    await db.blogPost.update({
      where: { id },
      data: { published },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
  } catch (error) {
    console.error("Error toggling blog post published status:", error);
    throw new Error("Failed to toggle blog post published status");
  }
}

// Analytics/Dashboard Actions
export async function getDashboardStats() {
  try {
    const [totalProducts, totalOrders, totalCustomers, totalRevenue] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.customer.count(),
      db.order.aggregate({
        _sum: {
          total: true,
        },
      }),
    ]);

    return {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: totalRevenue._sum.total || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard stats");
  }
}

export async function getRecentOrders(limit: number = 5) {
  try {
    const orders = await db.order.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    return orders;
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    throw new Error("Failed to fetch recent orders");
  }
}
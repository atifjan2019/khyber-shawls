-- PostgreSQL Data Import for Supabase
-- Converted from MySQL dump

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Insert users
INSERT INTO "users" ("id", "email", "name", "password", "role", "createdAt", "updatedAt") VALUES 
('cmhg2om480000nb014v38f5ao', 'atifjan2019@gmail.com', 'Atif Jan', '$2b$12$w27ICjr84Dy/Mv.b2NFI7umN7idmCAqq6/gGkHPsi1cZ60rg/zHMC', 'ADMIN', '2025-11-01 09:21:16.281', '2025-11-01 09:21:16.281')
ON CONFLICT (id) DO NOTHING;

-- Insert categories
INSERT INTO "categories" ("id", "name", "slug", "summary", "featuredImageUrl", "featuredImageAlt", "createdAt", "updatedAt", "intro", "sections", "seoDescription", "seoTitle", "uiConfig") VALUES 
('cmhfvlpem0008s10kjml5l9m2', 'Men Shawls', 'men-shawls', NULL, '/uploads/87acbc6d-9b6a-4afe-b596-a67c371d2731-1.avif', NULL, '2025-11-01 06:03:03.262', '2025-11-03 09:15:51.866', NULL, '[{"title":"MEN SHAWLS","description":"Rooted in the heritage of Pashtun tradition, the Men''s Shawl by KhyberWear represents a blend of cultural pride and timeless sophistication.","image":{"url":"/uploads/2-scaled.jpg","alt":""}}]', NULL, NULL, NULL),
('cmhfxb8bl0000o6012lyzmbvp', 'Kids Shawls', 'kids-shawls', NULL, '/uploads/ADI00721.webp', NULL, '2025-11-01 06:50:53.793', '2025-11-01 17:38:24.895', NULL, NULL, NULL, NULL, NULL),
('cmhgjsomn0000ph0197m3g3ux', 'Women Shawls', 'women-shals', NULL, '/uploads/11.jpg', NULL, '2025-11-01 17:20:19.631', '2025-12-04 08:02:18.796', NULL, NULL, NULL, NULL, NULL),
('cmieixoc9001npm01nin5jz4x', 'Charsadda Khaddar', 'charsaddakhaddar', NULL, '/uploads/3.jpg', 'CharsaddaKhaddar', '2025-11-25 12:00:22.903', '2025-11-28 18:18:24.381', NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert media
INSERT INTO "media" ("id", "url", "alt", "createdAt", "updatedAt") VALUES 
('cmhfwqxtg0002r10179es9r2a', '/uploads/1761978907048-074twf-bannersec.jpg', 'bannersec.jpg', '2025-11-01 06:35:07.058', '2025-11-01 06:35:07.058'),
('cmhfwqxtz0003r101pq8tmqc0', '/uploads/1761978907078-7ofmj-banner.jpg', 'banner.jpg', '2025-11-01 06:35:07.080', '2025-11-01 06:35:07.080'),
('cmhfx8aiv0000pl01f10v1891', 'https://khybershawls.store/uploads/1761978907078-7ofmj-banner.jpg', NULL, '2025-11-01 06:48:36.680', '2025-11-01 06:48:36.680'),
('cmhfx8b0v0003pl01xvrqywju', 'https://khybershawls.store/uploads/1761978907048-074twf-bannersec.jpg', NULL, '2025-11-01 06:48:37.327', '2025-11-01 06:48:37.327'),
('cmhix1byz0000rv0105a0v64e', '/uploads/1762160790489-s3qd3-Icon-Khyber-Shawl-(1).png', 'Icon-Khyber-Shawl (1).png', '2025-11-03 09:06:30.491', '2025-11-03 09:06:30.491')
ON CONFLICT (id) DO NOTHING;

-- Insert hero_media
INSERT INTO "hero_media" ("id", "key", "title", "subtitle", "description", "ctaLabel", "ctaHref", "backgroundImageId", "createdAt", "updatedAt") VALUES 
('cmhfvi75c0004s10kg5olh6m6', 'home', '', NULL, NULL, NULL, NULL, 'cmhfx8aiv0000pl01f10v1891', '2025-11-01 06:00:19.632', '2025-11-01 06:48:36.783'),
('cmhfvibdg0007s10kw26py27g', 'editorial', '', NULL, NULL, NULL, NULL, 'cmhfx8b0v0003pl01xvrqywju', '2025-11-01 06:00:25.108', '2025-11-01 06:48:37.333')
ON CONFLICT (id) DO NOTHING;

-- Insert settings
INSERT INTO "settings" ("id", "websiteName", "websiteLogoUrl", "websiteFaviconUrl", "contactPhone", "contactEmail", "contactAddress", "smtpHost", "smtpPort", "smtpUser", "smtpPass", "stripePublicKey", "stripeSecretKey", "socialLinks") VALUES 
('cmhiwlmk00000oy01954r1kmq', 'Khyber Shawls | Shawls for Men & Women', '', 'https://khybershawls.store/uploads/1762160790489-s3qd3-Icon-Khyber-Shawl-(1).png', '+92 3018768666', 'info@khybershawls.store', 'Office#27, Durrani Market, Charsadda 24420', NULL, NULL, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert Tags
INSERT INTO "Tag" ("id", "name") VALUES 
('cmifozv2f000lpm01a53nymq7', '7 Flowers Ladies Winter Shawl'),
('cmhkd2yo90000n0018mvxc3ki', 'Angora Wool Muffler'),
('cmie9g35i0005pm01o0rg3e3a', 'Black Classic Khaddar'),
('cmie9zhk2000gpm01sp56owx3', 'Camel Color Classic Khaddar'),
('cmie9vdgy000dpm01i983zo91', 'Chocolate Color Classic Khaddar'),
('cmie959gm0001pm01uf3fnrk5', 'Classic Khaddar'),
('cmiefplsf001jpm01srd3u15l', 'Customized Men Shawl'),
('cmie9qc2p0009pm01e9vuwp76', 'Dark Blue Classic Khaddar'),
('cmhkdia960004n001dz4d4qrk', 'Double Pure Wool Muffler'),
('cmhfvmshd000as10ka2io4sc0', 'Featured'),
('cmiecx5bh000ypm01y54qyjdm', 'Gray Classic Khaddar'),
('cmiedk0u6001apm01r4cqg5aj', 'Green Classic Khaddar'),
('cmhken30l000kn001yibg6iie', 'Handmade 3 Frame Borders'),
('cmhkf685l000tn001y360y76t', 'Handmade Frame Border'),
('cmhkdqsdf0008n001urvdeq58', 'Handmade Pure Wool Shawl (100% Wool) | Salam Pora Made Classic Solid Colors'),
('cmied2e3p0012pm01nj7rzsvz', 'Light Brown Classic Khaddar'),
('cmied8dbt0016pm01aaawcm4i', 'Light Camel Classic Khaddar'),
('cmifooep6000hpm010m74rg12', 'Luxury Black Embroidered Pashmina Shawl'),
('cmhkevwv9000pn001y27lkot9', 'Luxury Pure Lamb''s Wool (48/2) Handmade Double-Weight Shawl | White & Skin Colors'),
('cmifnwaud0009pm01n5leii88', 'Men Black Shawl'),
('cmifngj940001pm014kwblgd8', 'Men Blue Shawl'),
('cmifoeldd000dpm01ne202yjv', 'Pashmina Jalalpuri Men Shawl'),
('cmhken30m000ln00132ppzsfn', 'Pure Australian Wool Men Shawl'),
('cmhkdzs99000cn001pjh0d17d', 'Pure Wool Shawl Maroon'),
('cmieduhx9001epm0195me643j', 'White Classic Khaddar'),
('cmifnlp4f0005pm01u3l25wud', 'Winter Customized Men Shawl')
ON CONFLICT (id) DO NOTHING;

-- Insert products (simplified - main ones)
INSERT INTO "products" ("id", "name", "description", "details", "careInstructions", "price", "image", "categoryId", "inStock", "createdAt", "updatedAt", "published", "slug") VALUES 
('cmhgj1x5t0002nz01h2rul3gw', 'Handmade Pure Wool Shawl | Maroon Color', 'Stay Warm and Stylish with Our Wool Shawl', 'Handmade', 'Warm Water', 4999, '/uploads/1762016689002-1.webp', 'cmhfvlpem0008s10kjml5l9m2', true, '2025-11-01 16:59:30.978', '2025-11-03 09:13:48.651', true, 'handmade-pure-wool-shawl-maroon-color'),
('cmhkd2ypo0002n00137kjgb6s', 'Handmade Angora Wool Muffler', 'Stay warm, cozy, and effortlessly stylish with our Handmade Angora Wool Muffler', 'Handmade Angora Wool Muffler for unmatched warmth and style.', 'If hand washing, use cold water and a mild wool detergent.', 2999, '', 'cmhfvlpem0008s10kjml5l9m2', true, '2025-11-04 09:23:26.651', '2025-11-05 07:58:43.619', true, 'handmade-angora-wool-muffler'),
('cmhkdia9f0006n001qrold30k', 'Double Pure 100% Wool Handmade Muffler', 'Experience the unmatched warmth and sophistication of our Double Pure 100% Wool Handmade Muffler', 'Material: 100% Pure Wool', 'Dry clean recommended', 2500, '/uploads/1762248921434-imgi_4_retouch_2025102112590161.avif', 'cmhfvlpem0008s10kjml5l9m2', true, '2025-11-04 09:35:21.459', '2025-11-05 07:58:30.092', true, 'double-pure-100-wool-handmade-muffler'),
('cmhkdqsdp000an0019oi5a57m', 'Handmade Pure Wool Shawl (100% Wool) | Salam Pora Made Classic Solid Colors', 'Experience the authentic warmth and purity of our Handmade Pure Wool Shawl.', 'Material: 100% Pure Wool (Authentic Natural Fibers).', 'Dry clean only for best results.', 6500, '/uploads/1762249318159-imgi_2_WhatsApp-Image-2025-10-02-at-13.40.26-600x516.jpg', 'cmhfvlpem0008s10kjml5l9m2', true, '2025-11-04 09:41:58.189', '2025-11-05 07:57:50.906', true, 'handmade-pure-wool-shawl-100-wool-salam-pora-made-classic-solid-colors'),
('cmhkec8dw000in00121yw3d6h', 'Pure Wool Shawl Maroon', 'Wrap yourself in luxury with our Handmade Pure Wool Shawl', 'Material: 100% Pure Wool', 'Dry clean only.', 3799, '/uploads/1762250318683-imgi_51_1-1024x683.webp', 'cmhfvlpem0008s10kjml5l9m2', true, '2025-11-04 09:58:38.708', '2025-11-05 07:57:23.217', true, 'pure-wool-shawl-maroon'),
('cmhken30z000nn001ecm20kgi', 'Handmade 3 Frame Borders, Pure Australian Wool Men Shawl', 'Wrap yourself in the comfort of tradition and class', 'Material: 100% Pure Australian Wool (48-count fine yarn)', 'Dry clean only for best results.', 9500, '/uploads/1762250824954-imgi_2_l-b-600x599.webp', 'cmhfvlpem0008s10kjml5l9m2', true, '2025-11-04 10:07:04.978', '2025-11-05 07:53:41.364', true, 'handmade-3-frame-borders-pure-australian-wool-men-shawl'),
('cmhkevwvi000rn001u02dg1gj', 'Luxury Pure Lamb''s Wool (48/2) Handmade Double-Weight Shawl | White & Skin Colors', 'Experience pure refinement with our Handmade Double-Weight Shawl', 'Material: 100% Pure Lamb''s Wool (48/2 fine count)', 'Dry clean only — recommended for longevity.', 5999, '/uploads/1762251236884-imgi_3_Pure-Lamb-482.jpg', 'cmhfvlpem0008s10kjml5l9m2', true, '2025-11-04 10:13:56.910', '2025-11-05 07:57:02.195', true, 'luxury-pure-lamb-s-wool-48-2-handmade-double-weight-shawl-white-skin-colors'),
('cmhkf685t000wn0014p12th5k', 'Handmade Frame Border, Pure Australian Wool Men Shawl', 'Experience the art of fine craftsmanship', 'Pure Australian Wool', 'Dry clean only for best results.', 6900, '/uploads/1762251718081-imgi_4_IMG-20251013-WA0003_copy.webp', 'cmhfvlpem0008s10kjml5l9m2', true, '2025-11-04 10:21:58.097', '2025-11-05 07:55:51.049', true, 'handmade-frame-border-pure-australian-wool-men-shawl'),
('cmie959gw0003pm01y7coqjw9', 'Charsadda Handmade Badam Classic Khaddar', 'Charsadda Handmade Badam Classic Khaddar – Premium Winter Fabric', 'SIZE: Length: 8 Meters', 'Dry clean only for best results.', 3899, '/uploads/1764055580668-badam_color_2.webp', 'cmieixoc9001npm01nin5jz4x', true, '2025-11-25 07:26:20.720', '2025-11-25 12:03:15.898', true, 'charsadda-handmade-badam-classic-khaddar'),
('cmie9g35o0007pm01h6j0urvm', 'Charsadda Handmade Black Classic Khaddar', 'Charsadda Handmade Black Classic Khaddar | Warmth Meets Modern Elegance', 'Origin: Charsadda, Khyber Pakhtunkhwa, Pakistan', 'Dry clean only for best results.', 3899, '/uploads/1764056085736-Black3.webp', 'cmieixoc9001npm01nin5jz4x', true, '2025-11-25 07:34:45.756', '2025-11-25 12:03:33.248', true, 'charsadda-handmade-black-classic-khaddar'),
('cmie9qc2w000bpm014or7s5bb', 'Charsadda Handmade Dark Blue Classic Khaddar', 'Charsadda Handmade Dark Blue Classic Khaddar – Stay Warm and Stylish', 'SIZE: Length: 8 Meters', 'If hand washing, use cold water and mild detergent.', 3899, '/uploads/1764056563864-Bluekhaddar_1.webp', 'cmieixoc9001npm01nin5jz4x', true, '2025-11-25 07:42:43.881', '2025-11-25 12:05:20.609', true, 'charsadda-handmade-dark-blue-classic-khaddar'),
('cmie9vdh5000fpm01jnxkzbqr', 'Charsadda Handmade Chocolate Color Classic Khaddar', 'Charsadda Handmade Chocolate Color Classic Khaddar | Warmth, Heritage & Timeless Craftsmanship', 'Fabric Type: 100% Pure Wool Khaddar', 'Dry clean only for best results.', 3899, '/uploads/1764056798944-chocolate-(1).jpg', 'cmieixoc9001npm01nin5jz4x', true, '2025-11-25 07:46:38.970', '2025-11-25 12:04:58.792', true, 'charsadda-handmade-chocolate-color-classic-khaddar'),
('cmiea8h8i000qpm01bpd1hc6h', 'Charsadda Handmade Camel Color Classic Khaddar', 'Charsadda Handmade Camel Color Classic Khaddar – Timeless Craft, Winter Warmth', '100% Pure Wool Handmade Fabric', 'If hand washing, use cold water and mild detergent.', 3899, '/uploads/1764057410351-camel2_0ee46b9e-a0ee-4743-b578-debdda6d4c7e-(1).webp', 'cmieixoc9001npm01nin5jz4x', true, '2025-11-25 07:56:50.370', '2025-11-25 12:04:44.546', true, 'charsadda-handmade-camel-color-classic-khaddar'),
('cmiecx5bz0010pm01fnbiivqv', 'Charsadda Handmade Gray Classic Khaddar', 'Charsadda Handmade Gray Classic Khaddar – Timeless Elegance for Cold Days', 'SIZE: Length: 8 Meters', 'Dry clean only for best results.', 3899, '/uploads/1764061920523-Grey2.webp', 'cmieixoc9001npm01nin5jz4x', true, '2025-11-25 09:12:00.575', '2025-11-25 12:03:50.363', true, 'charsadda-handmade-gray-classic-khaddar'),
('cmied2e3t0014pm01gixv4mm7', 'Charsadda Handmade Light Brown Classic Khaddar', 'Charsadda Handmade Light Brown Classic Khaddar – Tradition Woven in Warmth', 'SIZE: Length: 8 Meters', 'Dry clean only for best results.', 3899, '/uploads/1764062165212-brown2.webp', 'cmieixoc9001npm01nin5jz4x', true, '2025-11-25 09:16:05.226', '2025-11-25 12:02:58.327', true, 'charsadda-handmade-light-brown-classic-khaddar'),
('cmied8dbx0018pm01xc15fhlk', 'Charsadda Handmade Light Camel Classic Khaddar', 'Charsadda Handmade Light Camel Classic Khaddar – Premium Warmth, Heritage & Style', 'SIZE: Length: 8 Meters', 'Dry clean only for best results.', 3899, '/uploads/1764062444145-469740497_935034225229832_4446554819621418018_n.webp', 'cmieixoc9001npm01nin5jz4x', true, '2025-11-25 09:20:44.158', '2025-11-25 12:02:00.208', true, 'charsadda-handmade-light-camel-classic-khaddar'),
('cmiedk0ub001cpm012yi7bs0w', 'Charsadda Handmade Green Classic Khaddar', 'Charsadda Handmade Green Classic Khaddar – Your Winter Style Essential', 'SIZE: Length: 8 Meters', 'Dry clean only for best results.', 3899, '/uploads/1764062987828-469981986_870300805178137_5149185440474464189_n.webp', 'cmieixoc9001npm01nin5jz4x', true, '2025-11-25 09:29:47.843', '2025-11-25 12:01:40.754', true, 'charsadda-handmade-green-classic-khaddar'),
('cmieduhxf001gpm01hra4975n', 'Charsadda Handmade White Classic Khaddar', 'Charsadda Handmade White Classic Khaddar – Elegant Warmth for Cold Days', 'SIZE: Length: 8 Meters', 'If hand washing, use cold water and mild detergent.', 3899, '/uploads/1764063476529-white2.webp', 'cmieixoc9001npm01nin5jz4x', true, '2025-11-25 09:37:56.547', '2025-11-25 12:01:16.861', true, 'charsadda-handmade-white-classic-khaddar'),
('cmifngj9d0003pm01ml4n31t3', '72 Wool Men Blue Shawl – Premium Handwoven Comfort and Style', '72 Wool Men Blue Shawl – Premium Handwoven Comfort and Style', 'Material: 100% Premium Wool', 'Dry clean only is recommended for best results.', 7500, '/uploads/1764140087383-7f6e356e-7ec0-4d56-8037-62d4c05b1891.webp', 'cmhfvlpem0008s10kjml5l9m2', true, '2025-11-26 06:54:47.425', '2025-11-26 06:54:47.425', true, '72-wool-men-blue-shawl-premium-handwoven-comfort-and-style'),
('cmifnlp4p0007pm01upxi1dm4', 'Winter Customized Men Shawl - Customise Men Shawl', 'Winter Customized Men Shawl – Customise Men Shawl', 'SIZE: Length: 8 Meters', 'Dry clean only is recommended for best results.', 3799.98, '/uploads/1764140328224-images.webp', 'cmhfvlpem0008s10kjml5l9m2', true, '2025-11-26 06:58:48.314', '2025-11-26 06:58:48.314', true, 'winter-customized-men-shawl-customise-men-shawl'),
('cmifnwauk000bpm013p7arl61', '72 Wool Men Black Shawl – Premium Handwoven Comfort and Style', '72 Wool Men Black Shawl – Premium Handwoven Comfort and Style', 'Material: 100% Premium Wool', 'Dry clean only is recommended for best results.', 7500, '/uploads/1764140822992-f3dbcd5b-89dd-4fc2-8bd1-be2539483d3e.webp', 'cmhfvlpem0008s10kjml5l9m2', true, '2025-11-26 07:07:03.021', '2025-11-26 07:07:03.021', true, '72-wool-men-black-shawl-premium-handwoven-comfort-and-style'),
('cmifoele7000fpm01ld23u0no', 'Pashmina Jalalpuri Men Shawl - Single Border', 'Pashmina Jalalpuri Men Shawl – Single Border: Timeless Tradition and Luxury', 'Material: 100% Pure Pashmina Wool (48-count fine yarn)', 'Dry clean only is recommended for best results.', 35000, '/uploads/1764141676414-IMG_0247-1-scaled.jpg', 'cmhfvlpem0008s10kjml5l9m2', true, '2025-11-26 07:21:16.493', '2025-11-26 07:21:16.493', true, 'pashmina-jalalpuri-men-shawl-single-border'),
('cmifooep9000jpm01na98v7kb', 'Luxury Black Embroidered Pashmina Shawl | Handmade Kashmiri Kani/Jaal Work', 'Wrap yourself in the timeless artistry of our Luxury Black Embroidered Pashmina Shawl.', 'Material: Premium Pashmina Blend', 'Dry clean only is recommended for best results.', 5499, '/uploads/1764142134364-lady-shawl-pashmina.jpg', 'cmhgjsomn0000ph0197m3g3ux', true, '2025-11-26 07:28:54.382', '2025-11-26 07:28:54.382', true, 'luxury-black-embroidered-pashmina-shawl-handmade-kashmiri-kani-jaal-work'),
('cmifozv2l000npm01u6vmq29w', '7 Flowers Ladies Winter Shawl', '7 Flowers Ladies Winter Shawl — Khyber Wear''s Signature Winter Elegance', 'Brand: Khyber Wear', NULL, 5198.98, '/uploads/1764142668792-e-1-scaled.webp', 'cmhgjsomn0000ph0197m3g3ux', true, '2025-11-26 07:37:48.813', '2025-11-26 07:37:48.813', true, '7-flowers-ladies-winter-shawl'),
('cmij69pcb0002pm018p92a6st', '96 - Aryy Machine Made Pure 100% Wool', 'Meet "96 – Aryy," a beautifully crafted machine-made shawl woven from pure 100 percent wool.', 'Material: 100 percent pure wool', 'Hand wash gently in cold water', 6500, '/uploads/1764353079536-4.jpg', 'cmhgjsomn0000ph0197m3g3ux', true, '2025-11-28 18:04:39.946', '2025-11-28 18:20:18.741', true, '96-aryy-machine-made-pure-100-wool')
ON CONFLICT (id) DO NOTHING;

-- Insert contact_entries
INSERT INTO "contact_entries" ("id", "name", "email", "message", "userId", "createdAt") VALUES 
('cmhzytyv40000n001b0gaa9ko', 'Atif Jan', 'atifjan2019@gmail.com', 'asdasdasdas', NULL, '2025-11-15 07:28:51.018')
ON CONFLICT (id) DO NOTHING;

-- Insert Orders
INSERT INTO "Order" ("id", "userId", "customerName", "customerEmail", "customerPhone", "shippingAddress", "notes", "total", "status", "createdAt", "updatedAt") VALUES 
('cmhfzf7xg0000qp01qz15pt35', 'YXRpZmphbjIwMTlA', 'Atif Jan', 'atifjan2019@gmail.com', '+923448959905', 'PO BOX Prang Hassan Khel Charsadda, Charsadda, 24420, Pakistan', NULL, 1, 'CANCELLED', '2025-11-01 07:49:59.140', '2025-11-08 08:45:05.954'),
('cmiis3q9p000opm01ks2wp7m6', NULL, 'Noman fiaz', 'sidhumoosewaladarkonly@gmail.com', '+923704876739', 'Vihari, Vihari , 61100, Pakistan', 'Original ho wool Ki\n\nPayment Method: Cash on Delivery\n\nDelivery: Normal (Rs 250)', 7500, 'CANCELLED', '2025-11-28 11:28:06.588', '2025-12-06 13:57:13.930')
ON CONFLICT (id) DO NOTHING;

-- Insert order_items
INSERT INTO "order_items" ("id", "orderId", "productId", "quantity", "price", "createdAt", "updatedAt") VALUES 
('cmiis3q9p000qpm01oi43ewff', 'cmiis3q9p000opm01ks2wp7m6', 'cmifngj9d0003pm01ml4n31t3', 1, 7500, '2025-11-28 11:28:06.588', '2025-11-28 11:28:06.588')
ON CONFLICT (id) DO NOTHING;

-- Insert _ProductTags
INSERT INTO "_ProductTags" ("A", "B") VALUES 
('cmhken30z000nn001ecm20kgi', 'cmhken30l000kn001yibg6iie'),
('cmhken30z000nn001ecm20kgi', 'cmhken30m000ln00132ppzsfn'),
('cmie959gw0003pm01y7coqjw9', 'cmie959gm0001pm01uf3fnrk5'),
('cmie9g35o0007pm01h6j0urvm', 'cmie9g35i0005pm01o0rg3e3a'),
('cmie9qc2w000bpm014or7s5bb', 'cmie9qc2p0009pm01e9vuwp76'),
('cmie9vdh5000fpm01jnxkzbqr', 'cmie9vdgy000dpm01i983zo91'),
('cmiea8h8i000qpm01bpd1hc6h', 'cmie9zhk2000gpm01sp56owx3'),
('cmiecx5bz0010pm01fnbiivqv', 'cmiecx5bh000ypm01y54qyjdm'),
('cmied2e3t0014pm01gixv4mm7', 'cmied2e3p0012pm01nj7rzsvz'),
('cmied8dbx0018pm01xc15fhlk', 'cmied8dbt0016pm01aaawcm4i'),
('cmiedk0ub001cpm012yi7bs0w', 'cmiedk0u6001apm01r4cqg5aj'),
('cmieduhxf001gpm01hra4975n', 'cmieduhx9001epm0195me643j'),
('cmifngj9d0003pm01ml4n31t3', 'cmifngj940001pm014kwblgd8'),
('cmifnlp4p0007pm01upxi1dm4', 'cmifnlp4f0005pm01u3l25wud'),
('cmifnwauk000bpm013p7arl61', 'cmifnwaud0009pm01n5leii88'),
('cmifoele7000fpm01ld23u0no', 'cmifoeldd000dpm01ne202yjv'),
('cmifooep9000jpm01na98v7kb', 'cmifooep6000hpm010m74rg12'),
('cmifozv2l000npm01u6vmq29w', 'cmifozv2f000lpm01a53nymq7')
ON CONFLICT DO NOTHING;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

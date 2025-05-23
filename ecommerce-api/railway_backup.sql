PGDMP  ;                     }           railway    16.8 (Debian 16.8-1.pgdg120+1)    17.4 �    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16384    railway    DATABASE     r   CREATE DATABASE railway WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE railway;
                     postgres    false            �           1247    16665    DeliveryType    TYPE     b   CREATE TYPE public."DeliveryType" AS ENUM (
    'PICKUP',
    'ADDRESS',
    'RAILWAY_STATION'
);
 !   DROP TYPE public."DeliveryType";
       public               postgres    false            o           1247    16410    OrderStatus    TYPE     o   CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'DELIVERED',
    'CANCELLED'
);
     DROP TYPE public."OrderStatus";
       public               postgres    false            l           1247    16404    PaymentMethod    TYPE     �   CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'TWINT',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER'
);
 "   DROP TYPE public."PaymentMethod";
       public               postgres    false            �           1247    16538    PaymentStatus    TYPE     Z   CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'REFUNDED'
);
 "   DROP TYPE public."PaymentStatus";
       public               postgres    false            �           1247    16531 	   TokenType    TYPE     ^   CREATE TYPE public."TokenType" AS ENUM (
    'ACCESS',
    'REFRESH',
    'RESET_PASSWORD'
);
    DROP TYPE public."TokenType";
       public               postgres    false            i           1247    16399    UserRole    TYPE     E   CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'CLIENT'
);
    DROP TYPE public."UserRole";
       public               postgres    false            �            1259    16673    AddressDelivery    TABLE     n  CREATE TABLE public."AddressDelivery" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    street text NOT NULL,
    house text NOT NULL,
    apartment text,
    city text NOT NULL,
    "postalCode" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 %   DROP TABLE public."AddressDelivery";
       public         heap r       postgres    false            �            1259    16672    AddressDelivery_id_seq    SEQUENCE     �   CREATE SEQUENCE public."AddressDelivery_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public."AddressDelivery_id_seq";
       public               postgres    false    235            �           0    0    AddressDelivery_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public."AddressDelivery_id_seq" OWNED BY public."AddressDelivery".id;
          public               postgres    false    234            �            1259    16478    Cart    TABLE     �   CREATE TABLE public."Cart" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."Cart";
       public         heap r       postgres    false            �            1259    16486    CartItem    TABLE     �   CREATE TABLE public."CartItem" (
    id integer NOT NULL,
    "cartId" integer NOT NULL,
    "productId" integer NOT NULL,
    quantity integer NOT NULL
);
    DROP TABLE public."CartItem";
       public         heap r       postgres    false            �            1259    16485    CartItem_id_seq    SEQUENCE     �   CREATE SEQUENCE public."CartItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public."CartItem_id_seq";
       public               postgres    false    229                        0    0    CartItem_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public."CartItem_id_seq" OWNED BY public."CartItem".id;
          public               postgres    false    228            �            1259    16477    Cart_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Cart_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public."Cart_id_seq";
       public               postgres    false    227                       0    0    Cart_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public."Cart_id_seq" OWNED BY public."Cart".id;
          public               postgres    false    226            �            1259    16585    Category    TABLE     �   CREATE TABLE public."Category" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."Category";
       public         heap r       postgres    false            �            1259    16584    Category_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public."Category_id_seq";
       public               postgres    false    231                       0    0    Category_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;
          public               postgres    false    230            �            1259    25300 	   GuestInfo    TABLE     O  CREATE TABLE public."GuestInfo" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."GuestInfo";
       public         heap r       postgres    false            �            1259    25299    GuestInfo_id_seq    SEQUENCE     �   CREATE SEQUENCE public."GuestInfo_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public."GuestInfo_id_seq";
       public               postgres    false    245                       0    0    GuestInfo_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public."GuestInfo_id_seq" OWNED BY public."GuestInfo".id;
          public               postgres    false    244            �            1259    16459    Order    TABLE       CREATE TABLE public."Order" (
    id integer NOT NULL,
    "userId" integer,
    "totalAmount" numeric(10,2) NOT NULL,
    "paymentMethod" public."PaymentMethod",
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "trackingNumber" text,
    discount numeric(10,2),
    "deliveryType" public."DeliveryType" DEFAULT 'RAILWAY_STATION'::public."DeliveryType" NOT NULL,
    "notesAdmin" text,
    "notesClient" text,
    changes text[] DEFAULT ARRAY[]::text[],
    "lastNotificationSent" timestamp(3) without time zone
);
    DROP TABLE public."Order";
       public         heap r       postgres    false    879    906    915    876    906    879    915            �            1259    16470 	   OrderItem    TABLE     �   CREATE TABLE public."OrderItem" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "productId" integer NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL
);
    DROP TABLE public."OrderItem";
       public         heap r       postgres    false            �            1259    16469    OrderItem_id_seq    SEQUENCE     �   CREATE SEQUENCE public."OrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public."OrderItem_id_seq";
       public               postgres    false    225                       0    0    OrderItem_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public."OrderItem_id_seq" OWNED BY public."OrderItem".id;
          public               postgres    false    224            �            1259    16458    Order_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public."Order_id_seq";
       public               postgres    false    223                       0    0    Order_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;
          public               postgres    false    222            �            1259    16691    PickupDelivery    TABLE     H  CREATE TABLE public."PickupDelivery" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "storeId" integer NOT NULL,
    "pickupTime" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 $   DROP TABLE public."PickupDelivery";
       public         heap r       postgres    false            �            1259    16690    PickupDelivery_id_seq    SEQUENCE     �   CREATE SEQUENCE public."PickupDelivery_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public."PickupDelivery_id_seq";
       public               postgres    false    239                       0    0    PickupDelivery_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public."PickupDelivery_id_seq" OWNED BY public."PickupDelivery".id;
          public               postgres    false    238            �            1259    16440    Product    TABLE     K  CREATE TABLE public."Product" (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    images text[],
    price numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "categoryId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    assortment text[],
    description_full text NOT NULL,
    image text NOT NULL,
    recipe text NOT NULL,
    umovy text NOT NULL,
    weight text NOT NULL
);
    DROP TABLE public."Product";
       public         heap r       postgres    false            �            1259    16439    Product_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public."Product_id_seq";
       public               postgres    false    221                       0    0    Product_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;
          public               postgres    false    220            �            1259    16699    RailwayStation    TABLE     K  CREATE TABLE public."RailwayStation" (
    id integer NOT NULL,
    city text NOT NULL,
    name text NOT NULL,
    "meetingPoint" text NOT NULL,
    photo text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "indexNumber" integer
);
 $   DROP TABLE public."RailwayStation";
       public         heap r       postgres    false            �            1259    16698    RailwayStation_id_seq    SEQUENCE     �   CREATE SEQUENCE public."RailwayStation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public."RailwayStation_id_seq";
       public               postgres    false    241                       0    0    RailwayStation_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public."RailwayStation_id_seq" OWNED BY public."RailwayStation".id;
          public               postgres    false    240            �            1259    16595    Review    TABLE     7  CREATE TABLE public."Review" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "productId" integer NOT NULL,
    rating smallint NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."Review";
       public         heap r       postgres    false            �            1259    16594    Review_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Review_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public."Review_id_seq";
       public               postgres    false    233            	           0    0    Review_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public."Review_id_seq" OWNED BY public."Review".id;
          public               postgres    false    232            �            1259    16683    StationDelivery    TABLE     L  CREATE TABLE public."StationDelivery" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "stationId" integer NOT NULL,
    "meetingTime" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 %   DROP TABLE public."StationDelivery";
       public         heap r       postgres    false            �            1259    16682    StationDelivery_id_seq    SEQUENCE     �   CREATE SEQUENCE public."StationDelivery_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public."StationDelivery_id_seq";
       public               postgres    false    237            
           0    0    StationDelivery_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public."StationDelivery_id_seq" OWNED BY public."StationDelivery".id;
          public               postgres    false    236            �            1259    16709    Store    TABLE     b  CREATE TABLE public."Store" (
    id integer NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    "postalCode" text NOT NULL,
    phone text,
    "workingHours" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."Store";
       public         heap r       postgres    false            �            1259    16708    Store_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Store_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public."Store_id_seq";
       public               postgres    false    243                       0    0    Store_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public."Store_id_seq" OWNED BY public."Store".id;
          public               postgres    false    242            �            1259    16430    Token    TABLE     #  CREATE TABLE public."Token" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    type public."TokenType" NOT NULL
);
    DROP TABLE public."Token";
       public         heap r       postgres    false    903            �            1259    16429    Token_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Token_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public."Token_id_seq";
       public               postgres    false    219                       0    0    Token_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public."Token_id_seq" OWNED BY public."Token".id;
          public               postgres    false    218            �            1259    16420    User    TABLE     6  CREATE TABLE public."User" (
    id integer NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    phone text,
    role public."UserRole" DEFAULT 'CLIENT'::public."UserRole" NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "deliveryAddress" jsonb,
    "preferredDeliveryType" text,
    "preferredStation" jsonb,
    "preferredStore" jsonb
);
    DROP TABLE public."User";
       public         heap r       postgres    false    873    873            �            1259    16419    User_id_seq    SEQUENCE     �   CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public."User_id_seq";
       public               postgres    false    217                       0    0    User_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;
          public               postgres    false    216            �            1259    16389    _prisma_migrations    TABLE     �  CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);
 &   DROP TABLE public._prisma_migrations;
       public         heap r       postgres    false            �           2604    16748    AddressDelivery id    DEFAULT     |   ALTER TABLE ONLY public."AddressDelivery" ALTER COLUMN id SET DEFAULT nextval('public."AddressDelivery_id_seq"'::regclass);
 C   ALTER TABLE public."AddressDelivery" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    234    235    235            �           2604    16749    Cart id    DEFAULT     f   ALTER TABLE ONLY public."Cart" ALTER COLUMN id SET DEFAULT nextval('public."Cart_id_seq"'::regclass);
 8   ALTER TABLE public."Cart" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    227    226    227            �           2604    16750    CartItem id    DEFAULT     n   ALTER TABLE ONLY public."CartItem" ALTER COLUMN id SET DEFAULT nextval('public."CartItem_id_seq"'::regclass);
 <   ALTER TABLE public."CartItem" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    228    229    229            �           2604    16751    Category id    DEFAULT     n   ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);
 <   ALTER TABLE public."Category" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    231    230    231                       2604    25303    GuestInfo id    DEFAULT     p   ALTER TABLE ONLY public."GuestInfo" ALTER COLUMN id SET DEFAULT nextval('public."GuestInfo_id_seq"'::regclass);
 =   ALTER TABLE public."GuestInfo" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    245    244    245            �           2604    16752    Order id    DEFAULT     h   ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);
 9   ALTER TABLE public."Order" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    222    223    223            �           2604    16753    OrderItem id    DEFAULT     p   ALTER TABLE ONLY public."OrderItem" ALTER COLUMN id SET DEFAULT nextval('public."OrderItem_id_seq"'::regclass);
 =   ALTER TABLE public."OrderItem" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    224    225    225            �           2604    16754    PickupDelivery id    DEFAULT     z   ALTER TABLE ONLY public."PickupDelivery" ALTER COLUMN id SET DEFAULT nextval('public."PickupDelivery_id_seq"'::regclass);
 B   ALTER TABLE public."PickupDelivery" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    239    238    239            �           2604    16755 
   Product id    DEFAULT     l   ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);
 ;   ALTER TABLE public."Product" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    221    220    221            �           2604    16756    RailwayStation id    DEFAULT     z   ALTER TABLE ONLY public."RailwayStation" ALTER COLUMN id SET DEFAULT nextval('public."RailwayStation_id_seq"'::regclass);
 B   ALTER TABLE public."RailwayStation" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    240    241    241            �           2604    16757 	   Review id    DEFAULT     j   ALTER TABLE ONLY public."Review" ALTER COLUMN id SET DEFAULT nextval('public."Review_id_seq"'::regclass);
 :   ALTER TABLE public."Review" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    233    232    233            �           2604    16758    StationDelivery id    DEFAULT     |   ALTER TABLE ONLY public."StationDelivery" ALTER COLUMN id SET DEFAULT nextval('public."StationDelivery_id_seq"'::regclass);
 C   ALTER TABLE public."StationDelivery" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    236    237    237                       2604    16759    Store id    DEFAULT     h   ALTER TABLE ONLY public."Store" ALTER COLUMN id SET DEFAULT nextval('public."Store_id_seq"'::regclass);
 9   ALTER TABLE public."Store" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    242    243    243            �           2604    16760    Token id    DEFAULT     h   ALTER TABLE ONLY public."Token" ALTER COLUMN id SET DEFAULT nextval('public."Token_id_seq"'::regclass);
 9   ALTER TABLE public."Token" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    219    218    219            �           2604    16761    User id    DEFAULT     f   ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);
 8   ALTER TABLE public."User" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    217    216    217            �          0    16673    AddressDelivery 
   TABLE DATA           �   COPY public."AddressDelivery" (id, "orderId", street, house, apartment, city, "postalCode", "createdAt", "updatedAt") FROM stdin;
    public               postgres    false    235   s�       �          0    16478    Cart 
   TABLE DATA           H   COPY public."Cart" (id, "userId", "createdAt", "updatedAt") FROM stdin;
    public               postgres    false    227   ��       �          0    16486    CartItem 
   TABLE DATA           I   COPY public."CartItem" (id, "cartId", "productId", quantity) FROM stdin;
    public               postgres    false    229   ��       �          0    16585    Category 
   TABLE DATA           U   COPY public."Category" (id, name, description, "createdAt", "updatedAt") FROM stdin;
    public               postgres    false    231   �       �          0    25300 	   GuestInfo 
   TABLE DATA           u   COPY public."GuestInfo" (id, "orderId", "firstName", "lastName", email, phone, "createdAt", "updatedAt") FROM stdin;
    public               postgres    false    245   
�       �          0    16459    Order 
   TABLE DATA           �   COPY public."Order" (id, "userId", "totalAmount", "paymentMethod", status, "createdAt", "updatedAt", "paymentStatus", "trackingNumber", discount, "deliveryType", "notesAdmin", "notesClient", changes, "lastNotificationSent") FROM stdin;
    public               postgres    false    223   ��       �          0    16470 	   OrderItem 
   TABLE DATA           R   COPY public."OrderItem" (id, "orderId", "productId", quantity, price) FROM stdin;
    public               postgres    false    225   \�       �          0    16691    PickupDelivery 
   TABLE DATA           l   COPY public."PickupDelivery" (id, "orderId", "storeId", "pickupTime", "createdAt", "updatedAt") FROM stdin;
    public               postgres    false    239   ��       �          0    16440    Product 
   TABLE DATA           �   COPY public."Product" (id, name, description, images, price, "createdAt", "updatedAt", "categoryId", "isActive", stock, assortment, description_full, image, recipe, umovy, weight) FROM stdin;
    public               postgres    false    221   H�       �          0    16699    RailwayStation 
   TABLE DATA           z   COPY public."RailwayStation" (id, city, name, "meetingPoint", photo, "createdAt", "updatedAt", "indexNumber") FROM stdin;
    public               postgres    false    241   ��       �          0    16595    Review 
   TABLE DATA           h   COPY public."Review" (id, "userId", "productId", rating, comment, "createdAt", "updatedAt") FROM stdin;
    public               postgres    false    233    �       �          0    16683    StationDelivery 
   TABLE DATA           p   COPY public."StationDelivery" (id, "orderId", "stationId", "meetingTime", "createdAt", "updatedAt") FROM stdin;
    public               postgres    false    237   �       �          0    16709    Store 
   TABLE DATA           y   COPY public."Store" (id, name, address, city, "postalCode", phone, "workingHours", "createdAt", "updatedAt") FROM stdin;
    public               postgres    false    243   ��       �          0    16430    Token 
   TABLE DATA           V   COPY public."Token" (id, "userId", token, "createdAt", "expiresAt", type) FROM stdin;
    public               postgres    false    219   .�       �          0    16420    User 
   TABLE DATA           �   COPY public."User" (id, "firstName", "lastName", email, phone, role, password, "createdAt", "updatedAt", "isActive", "deliveryAddress", "preferredDeliveryType", "preferredStation", "preferredStore") FROM stdin;
    public               postgres    false    217   K�       �          0    16389    _prisma_migrations 
   TABLE DATA           �   COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
    public               postgres    false    215   ��                  0    0    AddressDelivery_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public."AddressDelivery_id_seq"', 2, true);
          public               postgres    false    234                       0    0    CartItem_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public."CartItem_id_seq"', 1, false);
          public               postgres    false    228                       0    0    Cart_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public."Cart_id_seq"', 1, false);
          public               postgres    false    226                       0    0    Category_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public."Category_id_seq"', 4, true);
          public               postgres    false    230                       0    0    GuestInfo_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public."GuestInfo_id_seq"', 3, true);
          public               postgres    false    244                       0    0    OrderItem_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public."OrderItem_id_seq"', 39, true);
          public               postgres    false    224                       0    0    Order_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public."Order_id_seq"', 21, true);
          public               postgres    false    222                       0    0    PickupDelivery_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public."PickupDelivery_id_seq"', 4, true);
          public               postgres    false    238                       0    0    Product_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public."Product_id_seq"', 21, true);
          public               postgres    false    220                       0    0    RailwayStation_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public."RailwayStation_id_seq"', 9, true);
          public               postgres    false    240                       0    0    Review_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public."Review_id_seq"', 1, false);
          public               postgres    false    232                       0    0    StationDelivery_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public."StationDelivery_id_seq"', 5, true);
          public               postgres    false    236                       0    0    Store_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public."Store_id_seq"', 1, true);
          public               postgres    false    242                       0    0    Token_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public."Token_id_seq"', 1, false);
          public               postgres    false    218                       0    0    User_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public."User_id_seq"', 10, true);
          public               postgres    false    216            +           2606    16681 $   AddressDelivery AddressDelivery_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public."AddressDelivery"
    ADD CONSTRAINT "AddressDelivery_pkey" PRIMARY KEY (id);
 R   ALTER TABLE ONLY public."AddressDelivery" DROP CONSTRAINT "AddressDelivery_pkey";
       public                 postgres    false    235                        2606    16492    CartItem CartItem_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);
 D   ALTER TABLE ONLY public."CartItem" DROP CONSTRAINT "CartItem_pkey";
       public                 postgres    false    229                       2606    16484    Cart Cart_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."Cart" DROP CONSTRAINT "Cart_pkey";
       public                 postgres    false    227            $           2606    16593    Category Category_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);
 D   ALTER TABLE ONLY public."Category" DROP CONSTRAINT "Category_pkey";
       public                 postgres    false    231            :           2606    25308    GuestInfo GuestInfo_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public."GuestInfo"
    ADD CONSTRAINT "GuestInfo_pkey" PRIMARY KEY (id);
 F   ALTER TABLE ONLY public."GuestInfo" DROP CONSTRAINT "GuestInfo_pkey";
       public                 postgres    false    245                       2606    16476    OrderItem OrderItem_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);
 F   ALTER TABLE ONLY public."OrderItem" DROP CONSTRAINT "OrderItem_pkey";
       public                 postgres    false    225                       2606    16468    Order Order_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);
 >   ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_pkey";
       public                 postgres    false    223            1           2606    16697 "   PickupDelivery PickupDelivery_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."PickupDelivery"
    ADD CONSTRAINT "PickupDelivery_pkey" PRIMARY KEY (id);
 P   ALTER TABLE ONLY public."PickupDelivery" DROP CONSTRAINT "PickupDelivery_pkey";
       public                 postgres    false    239                       2606    16448    Product Product_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);
 B   ALTER TABLE ONLY public."Product" DROP CONSTRAINT "Product_pkey";
       public                 postgres    false    221            4           2606    16707 "   RailwayStation RailwayStation_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."RailwayStation"
    ADD CONSTRAINT "RailwayStation_pkey" PRIMARY KEY (id);
 P   ALTER TABLE ONLY public."RailwayStation" DROP CONSTRAINT "RailwayStation_pkey";
       public                 postgres    false    241            &           2606    16603    Review Review_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);
 @   ALTER TABLE ONLY public."Review" DROP CONSTRAINT "Review_pkey";
       public                 postgres    false    233            .           2606    16689 $   StationDelivery StationDelivery_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public."StationDelivery"
    ADD CONSTRAINT "StationDelivery_pkey" PRIMARY KEY (id);
 R   ALTER TABLE ONLY public."StationDelivery" DROP CONSTRAINT "StationDelivery_pkey";
       public                 postgres    false    237            6           2606    16717    Store Store_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_pkey" PRIMARY KEY (id);
 >   ALTER TABLE ONLY public."Store" DROP CONSTRAINT "Store_pkey";
       public                 postgres    false    243                       2606    16438    Token Token_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public."Token"
    ADD CONSTRAINT "Token_pkey" PRIMARY KEY (id);
 >   ALTER TABLE ONLY public."Token" DROP CONSTRAINT "Token_pkey";
       public                 postgres    false    219            
           2606    16428    User User_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
       public                 postgres    false    217                       2606    16397 *   _prisma_migrations _prisma_migrations_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
       public                 postgres    false    215            )           1259    16718    AddressDelivery_orderId_key    INDEX     g   CREATE UNIQUE INDEX "AddressDelivery_orderId_key" ON public."AddressDelivery" USING btree ("orderId");
 1   DROP INDEX public."AddressDelivery_orderId_key";
       public                 postgres    false    235                       1259    16608    CartItem_cartId_idx    INDEX     P   CREATE INDEX "CartItem_cartId_idx" ON public."CartItem" USING btree ("cartId");
 )   DROP INDEX public."CartItem_cartId_idx";
       public                 postgres    false    229            !           1259    16609    CartItem_productId_idx    INDEX     V   CREATE INDEX "CartItem_productId_idx" ON public."CartItem" USING btree ("productId");
 ,   DROP INDEX public."CartItem_productId_idx";
       public                 postgres    false    229                       1259    16494    Cart_userId_key    INDEX     O   CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");
 %   DROP INDEX public."Cart_userId_key";
       public                 postgres    false    227            "           1259    16605    Category_name_key    INDEX     Q   CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);
 '   DROP INDEX public."Category_name_key";
       public                 postgres    false    231            7           1259    25310    GuestInfo_email_idx    INDEX     N   CREATE INDEX "GuestInfo_email_idx" ON public."GuestInfo" USING btree (email);
 )   DROP INDEX public."GuestInfo_email_idx";
       public                 postgres    false    245            8           1259    25309    GuestInfo_orderId_key    INDEX     [   CREATE UNIQUE INDEX "GuestInfo_orderId_key" ON public."GuestInfo" USING btree ("orderId");
 +   DROP INDEX public."GuestInfo_orderId_key";
       public                 postgres    false    245                       1259    16612    OrderItem_orderId_idx    INDEX     T   CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");
 +   DROP INDEX public."OrderItem_orderId_idx";
       public                 postgres    false    225                       1259    16613    OrderItem_productId_idx    INDEX     X   CREATE INDEX "OrderItem_productId_idx" ON public."OrderItem" USING btree ("productId");
 -   DROP INDEX public."OrderItem_productId_idx";
       public                 postgres    false    225                       1259    16611    Order_status_idx    INDEX     H   CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);
 &   DROP INDEX public."Order_status_idx";
       public                 postgres    false    223                       1259    16610    Order_userId_idx    INDEX     J   CREATE INDEX "Order_userId_idx" ON public."Order" USING btree ("userId");
 &   DROP INDEX public."Order_userId_idx";
       public                 postgres    false    223            /           1259    16720    PickupDelivery_orderId_key    INDEX     e   CREATE UNIQUE INDEX "PickupDelivery_orderId_key" ON public."PickupDelivery" USING btree ("orderId");
 0   DROP INDEX public."PickupDelivery_orderId_key";
       public                 postgres    false    239                       1259    16614    Product_categoryId_idx    INDEX     V   CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");
 ,   DROP INDEX public."Product_categoryId_idx";
       public                 postgres    false    221                       1259    16615    Product_name_idx    INDEX     H   CREATE INDEX "Product_name_idx" ON public."Product" USING btree (name);
 &   DROP INDEX public."Product_name_idx";
       public                 postgres    false    221            2           1259    16721    RailwayStation_city_name_key    INDEX     h   CREATE UNIQUE INDEX "RailwayStation_city_name_key" ON public."RailwayStation" USING btree (city, name);
 2   DROP INDEX public."RailwayStation_city_name_key";
       public                 postgres    false    241    241            '           1259    16607    Review_productId_idx    INDEX     R   CREATE INDEX "Review_productId_idx" ON public."Review" USING btree ("productId");
 *   DROP INDEX public."Review_productId_idx";
       public                 postgres    false    233            (           1259    16606    Review_userId_idx    INDEX     L   CREATE INDEX "Review_userId_idx" ON public."Review" USING btree ("userId");
 '   DROP INDEX public."Review_userId_idx";
       public                 postgres    false    233            ,           1259    16719    StationDelivery_orderId_key    INDEX     g   CREATE UNIQUE INDEX "StationDelivery_orderId_key" ON public."StationDelivery" USING btree ("orderId");
 1   DROP INDEX public."StationDelivery_orderId_key";
       public                 postgres    false    237                       1259    16617    Token_token_idx    INDEX     F   CREATE INDEX "Token_token_idx" ON public."Token" USING btree (token);
 %   DROP INDEX public."Token_token_idx";
       public                 postgres    false    219                       1259    16616    Token_token_key    INDEX     M   CREATE UNIQUE INDEX "Token_token_key" ON public."Token" USING btree (token);
 %   DROP INDEX public."Token_token_key";
       public                 postgres    false    219                       1259    16618    User_email_idx    INDEX     D   CREATE INDEX "User_email_idx" ON public."User" USING btree (email);
 $   DROP INDEX public."User_email_idx";
       public                 postgres    false    217                       1259    16493    User_email_key    INDEX     K   CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);
 $   DROP INDEX public."User_email_key";
       public                 postgres    false    217            E           2606    16722 ,   AddressDelivery AddressDelivery_orderId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."AddressDelivery"
    ADD CONSTRAINT "AddressDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 Z   ALTER TABLE ONLY public."AddressDelivery" DROP CONSTRAINT "AddressDelivery_orderId_fkey";
       public               postgres    false    223    3348    235            A           2606    16520    CartItem CartItem_cartId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public."CartItem" DROP CONSTRAINT "CartItem_cartId_fkey";
       public               postgres    false    229    3356    227            B           2606    16649     CartItem CartItem_productId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 N   ALTER TABLE ONLY public."CartItem" DROP CONSTRAINT "CartItem_productId_fkey";
       public               postgres    false    3346    229    221            @           2606    16515    Cart Cart_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 C   ALTER TABLE ONLY public."Cart" DROP CONSTRAINT "Cart_userId_fkey";
       public               postgres    false    217    3338    227            J           2606    25316     GuestInfo GuestInfo_orderId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."GuestInfo"
    ADD CONSTRAINT "GuestInfo_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 N   ALTER TABLE ONLY public."GuestInfo" DROP CONSTRAINT "GuestInfo_orderId_fkey";
       public               postgres    false    223    245    3348            >           2606    16634     OrderItem OrderItem_orderId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 N   ALTER TABLE ONLY public."OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";
       public               postgres    false    225    223    3348            ?           2606    16639 "   OrderItem OrderItem_productId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 P   ALTER TABLE ONLY public."OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";
       public               postgres    false    225    3346    221            =           2606    25311    Order Order_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 E   ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_userId_fkey";
       public               postgres    false    223    3338    217            H           2606    16737 *   PickupDelivery PickupDelivery_orderId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."PickupDelivery"
    ADD CONSTRAINT "PickupDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 X   ALTER TABLE ONLY public."PickupDelivery" DROP CONSTRAINT "PickupDelivery_orderId_fkey";
       public               postgres    false    223    3348    239            I           2606    16742 *   PickupDelivery PickupDelivery_storeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."PickupDelivery"
    ADD CONSTRAINT "PickupDelivery_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 X   ALTER TABLE ONLY public."PickupDelivery" DROP CONSTRAINT "PickupDelivery_storeId_fkey";
       public               postgres    false    243    239    3382            <           2606    16644    Product Product_categoryId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 M   ALTER TABLE ONLY public."Product" DROP CONSTRAINT "Product_categoryId_fkey";
       public               postgres    false    221    231    3364            C           2606    16659    Review Review_productId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 J   ALTER TABLE ONLY public."Review" DROP CONSTRAINT "Review_productId_fkey";
       public               postgres    false    233    3346    221            D           2606    16654    Review Review_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 G   ALTER TABLE ONLY public."Review" DROP CONSTRAINT "Review_userId_fkey";
       public               postgres    false    233    3338    217            F           2606    16727 ,   StationDelivery StationDelivery_orderId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."StationDelivery"
    ADD CONSTRAINT "StationDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 Z   ALTER TABLE ONLY public."StationDelivery" DROP CONSTRAINT "StationDelivery_orderId_fkey";
       public               postgres    false    223    237    3348            G           2606    16732 .   StationDelivery StationDelivery_stationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."StationDelivery"
    ADD CONSTRAINT "StationDelivery_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES public."RailwayStation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 \   ALTER TABLE ONLY public."StationDelivery" DROP CONSTRAINT "StationDelivery_stationId_fkey";
       public               postgres    false    3380    241    237            ;           2606    16495    Token Token_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Token"
    ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 E   ALTER TABLE ONLY public."Token" DROP CONSTRAINT "Token_userId_fkey";
       public               postgres    false    217    219    3338            �   S   x�3�4�༰��/l��pa��	�)�I@���m@�6q�r����*�X�Y[虛Z������ mj/      �      x������ � �      �      x������ � �      �   �   x���Mn�0���)|�D�qd�kt��^�@ժR�6e�L�O�O�������%K�g����^����\�|b�č�<>O�|�ǵS�A���EWy#��G��VX!�Tf�'�n��w�Fޱ#=�6�&vh\VxWx��|���@a�0fܾ�cף�Yu!��6|�q�3D���A&,j��&��־!��UB���>���N�ȭں]����Z%w�\?�Z�?���      �   �   x�u�1JCA���S�>�egvvwv�"e	A�F��I�����B� ��7�=�y����7�`2_����0�a{ �G&�(�[��x,�m� ���z�S����n�N?������{}� �$] ���������0��r��b���>�b�bS�!o�w���C}�=Xm�o7�vv��Ęr� )�� ��̅�p���Zc���]�      �   b  x���MN�0F��)r�X��O��EM���VM!UB�J/��k6�9	�3�7�.m��D�f1z���4K*�d�ˋayWL���@� & 1���� 1p��G1X��4r����2g�*�$+����c=ͦ�h�VO͊=��6�4 �\�?縨�ܿ�bP$��qm��$���Bw��wΛŲ�/��Y�n���W9�쉻K���!U*ݱ[H�MzF��F���@��|�X����T�^~h��|R�uh�����l���g�����֍��/�M�����($���3�Ps��|�]Ttr�P�QuQNn:$�?�I�0b%�R;����rp};>Z%� ��Y%LP�����֨^���zf<��_��      �   x   x�M��� D�P��G�����K&�>\���t�!�-�5@,M��I/d�p�y�̸}q+�o�e�:.����}n`���8��]��K��&�{C��۷�G<��H^|7f~ U�(�      �   T   x�u̱	�0D�Z�"��ɒ�5K��#*Ic���!�B1X4X/z�'��(���u�8��)�{��K���Nc��k����� |�      �   u	  x��Zmo��|�E-@w�}��o闢iAc�Χ@�$*�
R�rǍ�}���$S�H�/��������G�w�d�H�P�{����<���"�o��������W���;x����0�Mz߿����x}������^�Uv���g�3x�OS?(��r����?-����r>�s��S?�?��5�����-xw cǕ	�����>���>��g���у�������f��YmmQd�K)��<���߯���E&��Fc�\2[�L�,+&��v�eLr�4�RO�6�R��Z>ۀ�ZJ�&�:b]&8�N;4��0�E�.3�2�S^t��(�[���&e��mn�<N<���G?�<��4k\��Y��/`t@.<E[i����3�H�.��Q���r+O���_6E��-��G��r�_��{�C���^
�Vq����~N����!�hv��i�M�/ct���*�C���8@O���jR������������|�p.8 �q'Mg7	�?�<?�#�>�իo0�~c�!(p`O(Lew�1E�\BzfF;g��&"�hD�3�ta:��M�T�qo�mq>�8C;�d�@7���YAM9�Lf�f����f��y�I�[�g��煵1��c��A)�q�����cP�f��]\V�M������6~6BBI�� N���c����B-�"3�+�m)��l'3�
��W���?e�8Р̝����)L�;-g�rfY"��M�D���6��F�Q:�J����`�=E8QG+�x���A�ZvQ�X���V[$�aL��c�Z�Y�:
�U�Yk����Ir��f�l�\ƅQ�k�\�f;	ǢX�᜖M��v�,���XV��.�E��R��%"��������Ύ����%�z4�" p �W�m��d#�����P������=�	�?O�c�:2y�P�#0�>|LJu�8����}�0F�4U�����z@i�ΐb�� �b�����}?B�{ ����o4{�u+�^󇸻�i��sB|1:�<_�C���gH�*n����,W=���+�!=Oy��y������$!��x&<>�e�Gg>J���XxIء�C-��=���<���y���in�eܶ^�h�(d&�r �'���`ԥl��.Y��l��M^�k�@L.|2~�
d����Y�K���� ����e�0D�b&�$ I!�>&@�'5�.*�Q��	�vƕ�	��0-M����PMQ|A����ab�{�6�a����R�A�@TG�M���6s)F�O��N�b�Ժ (�`V����L�*�W�Yd��ၸ:�f]��� �l���q�e�nE�%����=:��\�f��J���2�
�W%�y꟧�_���Rr�_@jG�'�IFpŢP�����=�r�jbx���4���an���q,��)U��N0�I��(���7�O��[����5�Sz����'G7����b�om�l�P��� ��$FXވ-n�ʀ����9��5�
�M�K���t����ONP
�q�=�U����Ehqk��E L �0�j��� 3oN�Ɓ�(��ͷ���>}��夰�HT��b�����k��'��4J�^��Gȴ�hwGHc��j�����W����>�=�� �m.X����P;���Fs��+P��gJ��7\=ܢ ��Iq�Q��heMߛ�%H� �E��Q���	b��rn��v�<P���ח(M��LH\`'����L:�C����B���=�YW}~�I��� C�N�O�I��U1&Oc��k��f=��x�u���Z���;N7�:�J�!`f��.L�Oc�5�"c|�s?�i�h�&>��[��@2S��@u����U�W�����G��(�����F��.DQ���z�Ʀ]��R��[�c��^2�����۫\��͟IG��
7�6I#\��+�S&6�Z4���(@`L�������f�`O7mT�����

"��н���_~�w���ȾGἤ����0�J�o`���}@^Q�x������Mp��B)&2έ�R�o[���}�bq���r�
���& �@���m|��O�utQ5���8\���Z�D��#FV�z����8����
��4\H'�`*t*�%k�PkU`���'1�;�ߠT������������h�s�ǂ�c6�_A�ƾN��[��F�n~]ܑ�3�'
�)W(aY誂�k!��o�����D�շq�"��B[�_� ��ҫ誖���g�\:��R��w��kA�.q(9�c���a������?r+�,��V��u����Wv�н�����U�@��a<�Ϊ���ߗY�yEQ����ܫZ��6W�]M�U�W�������a&      �   #  x��нJA��z�)�����~^��hVi<E����T����AE1�0�FQL��00ÿ���U�q9�\|�=ޥ�oy�Oq�6s��n5�?��_�?�k~�9��<��"^ř�'��tT�p�z�CȜ��RN�=�
u�)�"�ˑ�����{Ŵ.��\�K!h�1#҈�����TC9hi����j������pG�GǛ*;�L�@S ��z�Ii�g�'?p)؜0G+I���0��UyQ|��W�7��_X
��5ʹ�p�2k��	�D�\y�Z{��$I>k}+      �      x������ � �      �   z   x�u��	1��g�"$x�ܬe��c�݁�a>}~�P���z��K�a3DCB�f����l��J���N�mUK�yrvB'�s͂��`ar�~�	��Y�'��{�,ߔ�I-[�5\C�?�0�Y�5�      �   w   x�3�0���x���*\lV����t�H���SHIU(J�u�I--��Q0�K�p��q^켰�{/�+X�� IN##]C#]cC#+CC+s=C#K\�\1z\\\ ��+�      �      x������ � �      �   1  x���I��J��Y��E�:Lr`�dUJ���8�,A&'�C�����q�D޳���WU/���^�m_�b�k�	�dEe��{Ǵ�+q_1yu�m�Y+]�s> �h��C?�)�׋i!����	}Q���=�ֺ��� "U0�&�IX�)$�=���Y/��u�K�R���g��i8SY��2{�t�G��I���y~��fҀ��B?��Z��r�N�����b�K)C��o�T�r�T� U��+8�~��.���G�э��P�a߽�����)��N?��;?6��l����خZcQ-`и���1#��
�k�i�	V������`ɿЦp�����S�Y�%2�Y#�N]'�v������m:���)k26�-�APR�S��V�c.h{P�ޛ������U.1N��H���%'�j�p���f��F�j�x�K��<�*|y�yksv��|�骆�&�PB�|E�LCeHT�c�-�����/5�5w�}:`�:[/3����.S�ti�}>���Xt5��e��\��Q?4��Cv�\ƴĥW_� \���dkX��=�20���_r(��*w��V:�{����r��*�1��`L9w�����d�M-q���l��/I �W�KO!��S���w?)���&���M
������� �� K\P%=�>%�P_�Ձ=�����p�>�Q�Mm$��U�?�L��.�gy��@��!�O�;����6��ݹn0���{LĨ���d�g�6��$�y��>���X}�z�hOxű<Jvi�~RQ,`Y���3�Կ��	_^^����      �   �  x����n9�����*�I����P�d��df�~ٗ���ؙ5P@]%�:�G0�n�������n�I�	؜Yv�E���>���f$�i�kQ,�y�Hq�Rg�<d	S��v�	)A�Ǻg�mR���r��������������u�� �z^�wS\a�%k��gj=���ֲ>�\cW��Y����4�rY\�i҈�F�x}��+���X�}uYU�;U�b��C��"���<�����8<���JB���W�Άk���H��%k�I�.��Wg���8�Wf�!r�Ē�4��I-��� ص�yi�ʐs��N��R��I% 9������x�~z:s���������?�⍳^��J�f9i.��zO�+�U�N�Rp��K�I8'�@����Zf����_I}��◚���Z:�)B�"f��	!��Wu���7?����������S�jT�v���x,H����vOUրҠ��;#ލ��1	M/���f�F~��pH����^��,�� �j�TQ6�#�@Ca>����yx��{��a>���T6��^��p��0.'6��ڒ���X׮w�>�Q�[3-�E*�{4T� �kEDÇN����R��N��A����J ����8����:���s����|ea��6$��p���b�i,i�a�q�� �Dt����l���/A�z]T��\nՇ*c&ˑ�͛��6!�Sy��
�k��B�6�T��A�z��e�|C��h����\Sx`�"�R��f6�dQE�'؃�%��L���covV��IG;�Hͤ'v��i��=dQ^�
2L��{�{��@1��d���[���5�%�Ij*:��˹g,�6�#��L�d�*hϼ'�4����[A�f3+�i�\��� ��d�G
Yqb$d�P�6���0��j=����z�1�����f(���J1�Y��j�J�8f&��=��CK��af�A��,��K��!���F��03�C6�%	$A���� {�MK�'�D>s�5S����՟�o=��f�J�4�����E[���L�),��{=
;@����v�/Y"����|��0(!�<�ї�a�ծ]s�"㹊�DcD���&QB�,��-"���������7l/�T�7���fn5��]�S�*i�:G�`;�[ˎ+��3e�׈T�a2����n3�	�͐��v�3��*ř��S��1��89_�2p�7�����O�0�G�^�[a��D������Wb     
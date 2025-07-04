PGDMP                       }        	   ecommerce    16.3    16.3 �    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    17027 	   ecommerce    DATABASE     �   CREATE DATABASE ecommerce WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_Switzerland.1252';
    DROP DATABASE ecommerce;
                postgres    false            �           0    0    DATABASE ecommerce    COMMENT     I   COMMENT ON DATABASE ecommerce IS 'e-commerce DB for SYRNYK online shop';
                   postgres    false    5090            �           1247    21195    DeliveryType    TYPE     b   CREATE TYPE public."DeliveryType" AS ENUM (
    'PICKUP',
    'ADDRESS',
    'RAILWAY_STATION'
);
 !   DROP TYPE public."DeliveryType";
       public          postgres    false            {           1247    17054    OrderStatus    TYPE     o   CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'DELIVERED',
    'CANCELLED'
);
     DROP TYPE public."OrderStatus";
       public          postgres    false            x           1247    17048    PaymentMethod    TYPE     �   CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'TWINT',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER'
);
 "   DROP TYPE public."PaymentMethod";
       public          postgres    false            �           1247    18120    PaymentStatus    TYPE     Z   CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'REFUNDED'
);
 "   DROP TYPE public."PaymentStatus";
       public          postgres    false            �           1247    18113 	   TokenType    TYPE     ^   CREATE TYPE public."TokenType" AS ENUM (
    'ACCESS',
    'REFRESH',
    'RESET_PASSWORD'
);
    DROP TYPE public."TokenType";
       public          postgres    false            u           1247    17042    UserRole    TYPE     E   CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'CLIENT'
);
    DROP TYPE public."UserRole";
       public          postgres    false            �            1259    21203    AddressDelivery    TABLE     n  CREATE TABLE public."AddressDelivery" (
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
       public         heap    postgres    false            �            1259    21202    AddressDelivery_id_seq    SEQUENCE     �   CREATE SEQUENCE public."AddressDelivery_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public."AddressDelivery_id_seq";
       public          postgres    false    235            �           0    0    AddressDelivery_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public."AddressDelivery_id_seq" OWNED BY public."AddressDelivery".id;
          public          postgres    false    234            �            1259    17122    Cart    TABLE     �   CREATE TABLE public."Cart" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."Cart";
       public         heap    postgres    false            �            1259    17130    CartItem    TABLE     �   CREATE TABLE public."CartItem" (
    id integer NOT NULL,
    "cartId" integer NOT NULL,
    "productId" integer NOT NULL,
    quantity integer NOT NULL
);
    DROP TABLE public."CartItem";
       public         heap    postgres    false            �            1259    17129    CartItem_id_seq    SEQUENCE     �   CREATE SEQUENCE public."CartItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public."CartItem_id_seq";
       public          postgres    false    229            �           0    0    CartItem_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public."CartItem_id_seq" OWNED BY public."CartItem".id;
          public          postgres    false    228            �            1259    17121    Cart_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Cart_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public."Cart_id_seq";
       public          postgres    false    227            �           0    0    Cart_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public."Cart_id_seq" OWNED BY public."Cart".id;
          public          postgres    false    226            �            1259    18167    Category    TABLE     �   CREATE TABLE public."Category" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."Category";
       public         heap    postgres    false            �            1259    18166    Category_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public."Category_id_seq";
       public          postgres    false    231            �           0    0    Category_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;
          public          postgres    false    230            �            1259    35978    DeliveryCity    TABLE     O  CREATE TABLE public."DeliveryCity" (
    id integer NOT NULL,
    "zoneId" integer NOT NULL,
    name text NOT NULL,
    "postalCode" text NOT NULL,
    "freeThreshold" numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 "   DROP TABLE public."DeliveryCity";
       public         heap    postgres    false            �            1259    35977    DeliveryCity_id_seq    SEQUENCE     �   CREATE SEQUENCE public."DeliveryCity_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public."DeliveryCity_id_seq";
       public          postgres    false    253            �           0    0    DeliveryCity_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public."DeliveryCity_id_seq" OWNED BY public."DeliveryCity".id;
          public          postgres    false    252                       1259    35998    DeliveryTimeSlot    TABLE     �  CREATE TABLE public."DeliveryTimeSlot" (
    id integer NOT NULL,
    name text NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    "dayOfWeek" integer,
    "zoneId" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 &   DROP TABLE public."DeliveryTimeSlot";
       public         heap    postgres    false                        1259    35997    DeliveryTimeSlot_id_seq    SEQUENCE     �   CREATE SEQUENCE public."DeliveryTimeSlot_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public."DeliveryTimeSlot_id_seq";
       public          postgres    false    257            �           0    0    DeliveryTimeSlot_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public."DeliveryTimeSlot_id_seq" OWNED BY public."DeliveryTimeSlot".id;
          public          postgres    false    256            �            1259    35968    DeliveryZone    TABLE     6  CREATE TABLE public."DeliveryZone" (
    id integer NOT NULL,
    name text NOT NULL,
    canton text NOT NULL,
    description text,
    "dayOfWeek" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 "   DROP TABLE public."DeliveryZone";
       public         heap    postgres    false            �            1259    35967    DeliveryZone_id_seq    SEQUENCE     �   CREATE SEQUENCE public."DeliveryZone_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public."DeliveryZone_id_seq";
       public          postgres    false    251            �           0    0    DeliveryZone_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public."DeliveryZone_id_seq" OWNED BY public."DeliveryZone".id;
          public          postgres    false    250            �            1259    28220 	   GuestInfo    TABLE     O  CREATE TABLE public."GuestInfo" (
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
       public         heap    postgres    false            �            1259    28219    GuestInfo_id_seq    SEQUENCE     �   CREATE SEQUENCE public."GuestInfo_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public."GuestInfo_id_seq";
       public          postgres    false    245            �           0    0    GuestInfo_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public."GuestInfo_id_seq" OWNED BY public."GuestInfo".id;
          public          postgres    false    244            �            1259    17103    Order    TABLE       CREATE TABLE public."Order" (
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
    "lastNotificationSent" timestamp(3) without time zone,
    "deliveryAddress" jsonb,
    "deliveryCost" numeric(10,2),
    "deliveryDate" timestamp(3) without time zone,
    "deliveryMethod" text,
    "deliveryPickupLocationId" integer,
    "deliveryStationId" integer,
    "deliveryTimeSlot" text
);
    DROP TABLE public."Order";
       public         heap    postgres    false    891    918    927    927    888    891    918            �            1259    17114 	   OrderItem    TABLE     �   CREATE TABLE public."OrderItem" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "productId" integer NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL
);
    DROP TABLE public."OrderItem";
       public         heap    postgres    false            �            1259    17113    OrderItem_id_seq    SEQUENCE     �   CREATE SEQUENCE public."OrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public."OrderItem_id_seq";
       public          postgres    false    225            �           0    0    OrderItem_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public."OrderItem_id_seq" OWNED BY public."OrderItem".id;
          public          postgres    false    224            �            1259    17102    Order_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public."Order_id_seq";
       public          postgres    false    223            �           0    0    Order_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;
          public          postgres    false    222            �            1259    21221    PickupDelivery    TABLE     H  CREATE TABLE public."PickupDelivery" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "storeId" integer NOT NULL,
    "pickupTime" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 $   DROP TABLE public."PickupDelivery";
       public         heap    postgres    false            �            1259    21220    PickupDelivery_id_seq    SEQUENCE     �   CREATE SEQUENCE public."PickupDelivery_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public."PickupDelivery_id_seq";
       public          postgres    false    239            �           0    0    PickupDelivery_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public."PickupDelivery_id_seq" OWNED BY public."PickupDelivery".id;
          public          postgres    false    238            �            1259    35988    PickupLocation    TABLE     S  CREATE TABLE public."PickupLocation" (
    id integer NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    "postalCode" text NOT NULL,
    "openingHours" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 $   DROP TABLE public."PickupLocation";
       public         heap    postgres    false            �            1259    35987    PickupLocation_id_seq    SEQUENCE     �   CREATE SEQUENCE public."PickupLocation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public."PickupLocation_id_seq";
       public          postgres    false    255            �           0    0    PickupLocation_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public."PickupLocation_id_seq" OWNED BY public."PickupLocation".id;
          public          postgres    false    254            �            1259    17084    Product    TABLE     }  CREATE TABLE public."Product" (
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
    weight text NOT NULL,
    "displayOrder" integer DEFAULT 9999 NOT NULL
);
    DROP TABLE public."Product";
       public         heap    postgres    false            �            1259    33498    ProductTranslation    TABLE     �   CREATE TABLE public."ProductTranslation" (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    language text NOT NULL,
    name text,
    description text,
    "descriptionFull" text,
    weight text,
    umovy text,
    recipe text
);
 (   DROP TABLE public."ProductTranslation";
       public         heap    postgres    false            �            1259    33497    ProductTranslation_id_seq    SEQUENCE     �   CREATE SEQUENCE public."ProductTranslation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public."ProductTranslation_id_seq";
       public          postgres    false    247            �           0    0    ProductTranslation_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public."ProductTranslation_id_seq" OWNED BY public."ProductTranslation".id;
          public          postgres    false    246            �            1259    17083    Product_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public."Product_id_seq";
       public          postgres    false    221            �           0    0    Product_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;
          public          postgres    false    220            �            1259    21229    RailwayStation    TABLE     K  CREATE TABLE public."RailwayStation" (
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
       public         heap    postgres    false            �            1259    33514    RailwayStationTranslation    TABLE     �   CREATE TABLE public."RailwayStationTranslation" (
    id integer NOT NULL,
    "stationId" integer NOT NULL,
    language text NOT NULL,
    name text,
    "meetingPoint" text
);
 /   DROP TABLE public."RailwayStationTranslation";
       public         heap    postgres    false            �            1259    33513     RailwayStationTranslation_id_seq    SEQUENCE     �   CREATE SEQUENCE public."RailwayStationTranslation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 9   DROP SEQUENCE public."RailwayStationTranslation_id_seq";
       public          postgres    false    249            �           0    0     RailwayStationTranslation_id_seq    SEQUENCE OWNED BY     i   ALTER SEQUENCE public."RailwayStationTranslation_id_seq" OWNED BY public."RailwayStationTranslation".id;
          public          postgres    false    248            �            1259    21228    RailwayStation_id_seq    SEQUENCE     �   CREATE SEQUENCE public."RailwayStation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public."RailwayStation_id_seq";
       public          postgres    false    241            �           0    0    RailwayStation_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public."RailwayStation_id_seq" OWNED BY public."RailwayStation".id;
          public          postgres    false    240            �            1259    18177    Review    TABLE     7  CREATE TABLE public."Review" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "productId" integer NOT NULL,
    rating smallint NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."Review";
       public         heap    postgres    false            �            1259    18176    Review_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Review_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public."Review_id_seq";
       public          postgres    false    233            �           0    0    Review_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public."Review_id_seq" OWNED BY public."Review".id;
          public          postgres    false    232            �            1259    21213    StationDelivery    TABLE     L  CREATE TABLE public."StationDelivery" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "stationId" integer NOT NULL,
    "meetingTime" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 %   DROP TABLE public."StationDelivery";
       public         heap    postgres    false            �            1259    21212    StationDelivery_id_seq    SEQUENCE     �   CREATE SEQUENCE public."StationDelivery_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public."StationDelivery_id_seq";
       public          postgres    false    237            �           0    0    StationDelivery_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public."StationDelivery_id_seq" OWNED BY public."StationDelivery".id;
          public          postgres    false    236            �            1259    21239    Store    TABLE     b  CREATE TABLE public."Store" (
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
       public         heap    postgres    false            �            1259    21238    Store_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Store_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public."Store_id_seq";
       public          postgres    false    243            �           0    0    Store_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public."Store_id_seq" OWNED BY public."Store".id;
          public          postgres    false    242            �            1259    17074    Token    TABLE     #  CREATE TABLE public."Token" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    type public."TokenType" NOT NULL
);
    DROP TABLE public."Token";
       public         heap    postgres    false    915            �            1259    17073    Token_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Token_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public."Token_id_seq";
       public          postgres    false    219            �           0    0    Token_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public."Token_id_seq" OWNED BY public."Token".id;
          public          postgres    false    218            �            1259    17064    User    TABLE     �  CREATE TABLE public."User" (
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
    "preferredStore" jsonb,
    "dataConsentAccepted" boolean DEFAULT false NOT NULL,
    "dataConsentDate" timestamp(3) without time zone,
    "dataConsentVersion" text,
    "marketingConsent" boolean DEFAULT false NOT NULL
);
    DROP TABLE public."User";
       public         heap    postgres    false    885    885            �            1259    17063    User_id_seq    SEQUENCE     �   CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public."User_id_seq";
       public          postgres    false    217            �           0    0    User_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;
          public          postgres    false    216            �            1259    17030    _prisma_migrations    TABLE     �  CREATE TABLE public._prisma_migrations (
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
       public         heap    postgres    false            �           2604    21206    AddressDelivery id    DEFAULT     |   ALTER TABLE ONLY public."AddressDelivery" ALTER COLUMN id SET DEFAULT nextval('public."AddressDelivery_id_seq"'::regclass);
 C   ALTER TABLE public."AddressDelivery" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    235    234    235            �           2604    17125    Cart id    DEFAULT     f   ALTER TABLE ONLY public."Cart" ALTER COLUMN id SET DEFAULT nextval('public."Cart_id_seq"'::regclass);
 8   ALTER TABLE public."Cart" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    226    227    227            �           2604    17133    CartItem id    DEFAULT     n   ALTER TABLE ONLY public."CartItem" ALTER COLUMN id SET DEFAULT nextval('public."CartItem_id_seq"'::regclass);
 <   ALTER TABLE public."CartItem" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    229    228    229            �           2604    18170    Category id    DEFAULT     n   ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);
 <   ALTER TABLE public."Category" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    230    231    231            �           2604    35981    DeliveryCity id    DEFAULT     v   ALTER TABLE ONLY public."DeliveryCity" ALTER COLUMN id SET DEFAULT nextval('public."DeliveryCity_id_seq"'::regclass);
 @   ALTER TABLE public."DeliveryCity" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    253    252    253            �           2604    36001    DeliveryTimeSlot id    DEFAULT     ~   ALTER TABLE ONLY public."DeliveryTimeSlot" ALTER COLUMN id SET DEFAULT nextval('public."DeliveryTimeSlot_id_seq"'::regclass);
 D   ALTER TABLE public."DeliveryTimeSlot" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    257    256    257            �           2604    35971    DeliveryZone id    DEFAULT     v   ALTER TABLE ONLY public."DeliveryZone" ALTER COLUMN id SET DEFAULT nextval('public."DeliveryZone_id_seq"'::regclass);
 @   ALTER TABLE public."DeliveryZone" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    251    250    251            �           2604    28223    GuestInfo id    DEFAULT     p   ALTER TABLE ONLY public."GuestInfo" ALTER COLUMN id SET DEFAULT nextval('public."GuestInfo_id_seq"'::regclass);
 =   ALTER TABLE public."GuestInfo" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    245    244    245            �           2604    17106    Order id    DEFAULT     h   ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);
 9   ALTER TABLE public."Order" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    222    223    223            �           2604    17117    OrderItem id    DEFAULT     p   ALTER TABLE ONLY public."OrderItem" ALTER COLUMN id SET DEFAULT nextval('public."OrderItem_id_seq"'::regclass);
 =   ALTER TABLE public."OrderItem" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    225    224    225            �           2604    21224    PickupDelivery id    DEFAULT     z   ALTER TABLE ONLY public."PickupDelivery" ALTER COLUMN id SET DEFAULT nextval('public."PickupDelivery_id_seq"'::regclass);
 B   ALTER TABLE public."PickupDelivery" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    239    238    239            �           2604    35991    PickupLocation id    DEFAULT     z   ALTER TABLE ONLY public."PickupLocation" ALTER COLUMN id SET DEFAULT nextval('public."PickupLocation_id_seq"'::regclass);
 B   ALTER TABLE public."PickupLocation" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    254    255    255            �           2604    17087 
   Product id    DEFAULT     l   ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);
 ;   ALTER TABLE public."Product" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    220    221    221            �           2604    33501    ProductTranslation id    DEFAULT     �   ALTER TABLE ONLY public."ProductTranslation" ALTER COLUMN id SET DEFAULT nextval('public."ProductTranslation_id_seq"'::regclass);
 F   ALTER TABLE public."ProductTranslation" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    247    246    247            �           2604    21232    RailwayStation id    DEFAULT     z   ALTER TABLE ONLY public."RailwayStation" ALTER COLUMN id SET DEFAULT nextval('public."RailwayStation_id_seq"'::regclass);
 B   ALTER TABLE public."RailwayStation" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    241    240    241            �           2604    33517    RailwayStationTranslation id    DEFAULT     �   ALTER TABLE ONLY public."RailwayStationTranslation" ALTER COLUMN id SET DEFAULT nextval('public."RailwayStationTranslation_id_seq"'::regclass);
 M   ALTER TABLE public."RailwayStationTranslation" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    249    248    249            �           2604    18180 	   Review id    DEFAULT     j   ALTER TABLE ONLY public."Review" ALTER COLUMN id SET DEFAULT nextval('public."Review_id_seq"'::regclass);
 :   ALTER TABLE public."Review" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    233    232    233            �           2604    21216    StationDelivery id    DEFAULT     |   ALTER TABLE ONLY public."StationDelivery" ALTER COLUMN id SET DEFAULT nextval('public."StationDelivery_id_seq"'::regclass);
 C   ALTER TABLE public."StationDelivery" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    236    237    237            �           2604    21242    Store id    DEFAULT     h   ALTER TABLE ONLY public."Store" ALTER COLUMN id SET DEFAULT nextval('public."Store_id_seq"'::regclass);
 9   ALTER TABLE public."Store" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    242    243    243            �           2604    17077    Token id    DEFAULT     h   ALTER TABLE ONLY public."Token" ALTER COLUMN id SET DEFAULT nextval('public."Token_id_seq"'::regclass);
 9   ALTER TABLE public."Token" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    219    218    219            �           2604    17067    User id    DEFAULT     f   ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);
 8   ALTER TABLE public."User" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    217    217            �          0    21203    AddressDelivery 
   TABLE DATA           �   COPY public."AddressDelivery" (id, "orderId", street, house, apartment, city, "postalCode", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    235   3
      �          0    17122    Cart 
   TABLE DATA           H   COPY public."Cart" (id, "userId", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    227   �
      �          0    17130    CartItem 
   TABLE DATA           I   COPY public."CartItem" (id, "cartId", "productId", quantity) FROM stdin;
    public          postgres    false    229   �
      �          0    18167    Category 
   TABLE DATA           U   COPY public."Category" (id, name, description, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    231   �
      �          0    35978    DeliveryCity 
   TABLE DATA           u   COPY public."DeliveryCity" (id, "zoneId", name, "postalCode", "freeThreshold", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    253   �      �          0    35998    DeliveryTimeSlot 
   TABLE DATA           �   COPY public."DeliveryTimeSlot" (id, name, "startTime", "endTime", "dayOfWeek", "zoneId", "isActive", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    257   �      �          0    35968    DeliveryZone 
   TABLE DATA           n   COPY public."DeliveryZone" (id, name, canton, description, "dayOfWeek", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    251   �      �          0    28220 	   GuestInfo 
   TABLE DATA           u   COPY public."GuestInfo" (id, "orderId", "firstName", "lastName", email, phone, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    245   )      �          0    17103    Order 
   TABLE DATA           v  COPY public."Order" (id, "userId", "totalAmount", "paymentMethod", status, "createdAt", "updatedAt", "paymentStatus", "trackingNumber", discount, "deliveryType", "notesAdmin", "notesClient", changes, "lastNotificationSent", "deliveryAddress", "deliveryCost", "deliveryDate", "deliveryMethod", "deliveryPickupLocationId", "deliveryStationId", "deliveryTimeSlot") FROM stdin;
    public          postgres    false    223   �      �          0    17114 	   OrderItem 
   TABLE DATA           R   COPY public."OrderItem" (id, "orderId", "productId", quantity, price) FROM stdin;
    public          postgres    false    225   �      �          0    21221    PickupDelivery 
   TABLE DATA           l   COPY public."PickupDelivery" (id, "orderId", "storeId", "pickupTime", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    239   �      �          0    35988    PickupLocation 
   TABLE DATA           {   COPY public."PickupLocation" (id, name, address, city, "postalCode", "openingHours", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    255   �      �          0    17084    Product 
   TABLE DATA           �   COPY public."Product" (id, name, description, images, price, "createdAt", "updatedAt", "categoryId", "isActive", stock, assortment, description_full, image, recipe, umovy, weight, "displayOrder") FROM stdin;
    public          postgres    false    221         �          0    33498    ProductTranslation 
   TABLE DATA           �   COPY public."ProductTranslation" (id, "productId", language, name, description, "descriptionFull", weight, umovy, recipe) FROM stdin;
    public          postgres    false    247   �"      �          0    21229    RailwayStation 
   TABLE DATA           z   COPY public."RailwayStation" (id, city, name, "meetingPoint", photo, "createdAt", "updatedAt", "indexNumber") FROM stdin;
    public          postgres    false    241   �"      �          0    33514    RailwayStationTranslation 
   TABLE DATA           f   COPY public."RailwayStationTranslation" (id, "stationId", language, name, "meetingPoint") FROM stdin;
    public          postgres    false    249   �#      �          0    18177    Review 
   TABLE DATA           h   COPY public."Review" (id, "userId", "productId", rating, comment, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    233   �$      �          0    21213    StationDelivery 
   TABLE DATA           p   COPY public."StationDelivery" (id, "orderId", "stationId", "meetingTime", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    237   �$      �          0    21239    Store 
   TABLE DATA           y   COPY public."Store" (id, name, address, city, "postalCode", phone, "workingHours", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    243   �%      �          0    17074    Token 
   TABLE DATA           V   COPY public."Token" (id, "userId", token, "createdAt", "expiresAt", type) FROM stdin;
    public          postgres    false    219   o&      �          0    17064    User 
   TABLE DATA           '  COPY public."User" (id, "firstName", "lastName", email, phone, role, password, "createdAt", "updatedAt", "isActive", "deliveryAddress", "preferredDeliveryType", "preferredStation", "preferredStore", "dataConsentAccepted", "dataConsentDate", "dataConsentVersion", "marketingConsent") FROM stdin;
    public          postgres    false    217   �&      �          0    17030    _prisma_migrations 
   TABLE DATA           �   COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
    public          postgres    false    215   �)      �           0    0    AddressDelivery_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public."AddressDelivery_id_seq"', 1, true);
          public          postgres    false    234            �           0    0    CartItem_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public."CartItem_id_seq"', 1, false);
          public          postgres    false    228            �           0    0    Cart_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public."Cart_id_seq"', 1, false);
          public          postgres    false    226            �           0    0    Category_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public."Category_id_seq"', 4, true);
          public          postgres    false    230            �           0    0    DeliveryCity_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public."DeliveryCity_id_seq"', 66, true);
          public          postgres    false    252            �           0    0    DeliveryTimeSlot_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public."DeliveryTimeSlot_id_seq"', 9, true);
          public          postgres    false    256            �           0    0    DeliveryZone_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public."DeliveryZone_id_seq"', 2, true);
          public          postgres    false    250                        0    0    GuestInfo_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public."GuestInfo_id_seq"', 6, true);
          public          postgres    false    244                       0    0    OrderItem_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public."OrderItem_id_seq"', 61, true);
          public          postgres    false    224                       0    0    Order_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public."Order_id_seq"', 38, true);
          public          postgres    false    222                       0    0    PickupDelivery_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public."PickupDelivery_id_seq"', 13, true);
          public          postgres    false    238                       0    0    PickupLocation_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public."PickupLocation_id_seq"', 1, true);
          public          postgres    false    254                       0    0    ProductTranslation_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public."ProductTranslation_id_seq"', 1, false);
          public          postgres    false    246                       0    0    Product_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public."Product_id_seq"', 15, true);
          public          postgres    false    220                       0    0     RailwayStationTranslation_id_seq    SEQUENCE SET     Q   SELECT pg_catalog.setval('public."RailwayStationTranslation_id_seq"', 20, true);
          public          postgres    false    248                       0    0    RailwayStation_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public."RailwayStation_id_seq"', 6, true);
          public          postgres    false    240            	           0    0    Review_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public."Review_id_seq"', 1, false);
          public          postgres    false    232            
           0    0    StationDelivery_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public."StationDelivery_id_seq"', 14, true);
          public          postgres    false    236                       0    0    Store_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public."Store_id_seq"', 1, true);
          public          postgres    false    242                       0    0    Token_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public."Token_id_seq"', 3, true);
          public          postgres    false    218                       0    0    User_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public."User_id_seq"', 17, true);
          public          postgres    false    216            �           2606    21211 $   AddressDelivery AddressDelivery_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public."AddressDelivery"
    ADD CONSTRAINT "AddressDelivery_pkey" PRIMARY KEY (id);
 R   ALTER TABLE ONLY public."AddressDelivery" DROP CONSTRAINT "AddressDelivery_pkey";
       public            postgres    false    235            �           2606    17136    CartItem CartItem_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);
 D   ALTER TABLE ONLY public."CartItem" DROP CONSTRAINT "CartItem_pkey";
       public            postgres    false    229            �           2606    17128    Cart Cart_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."Cart" DROP CONSTRAINT "Cart_pkey";
       public            postgres    false    227            �           2606    18175    Category Category_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);
 D   ALTER TABLE ONLY public."Category" DROP CONSTRAINT "Category_pkey";
       public            postgres    false    231                       2606    35986    DeliveryCity DeliveryCity_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public."DeliveryCity"
    ADD CONSTRAINT "DeliveryCity_pkey" PRIMARY KEY (id);
 L   ALTER TABLE ONLY public."DeliveryCity" DROP CONSTRAINT "DeliveryCity_pkey";
       public            postgres    false    253                       2606    36007 &   DeliveryTimeSlot DeliveryTimeSlot_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public."DeliveryTimeSlot"
    ADD CONSTRAINT "DeliveryTimeSlot_pkey" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public."DeliveryTimeSlot" DROP CONSTRAINT "DeliveryTimeSlot_pkey";
       public            postgres    false    257                       2606    35976    DeliveryZone DeliveryZone_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public."DeliveryZone"
    ADD CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY (id);
 L   ALTER TABLE ONLY public."DeliveryZone" DROP CONSTRAINT "DeliveryZone_pkey";
       public            postgres    false    251            �           2606    28228    GuestInfo GuestInfo_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public."GuestInfo"
    ADD CONSTRAINT "GuestInfo_pkey" PRIMARY KEY (id);
 F   ALTER TABLE ONLY public."GuestInfo" DROP CONSTRAINT "GuestInfo_pkey";
       public            postgres    false    245            �           2606    17120    OrderItem OrderItem_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);
 F   ALTER TABLE ONLY public."OrderItem" DROP CONSTRAINT "OrderItem_pkey";
       public            postgres    false    225            �           2606    17112    Order Order_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);
 >   ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_pkey";
       public            postgres    false    223            �           2606    21227 "   PickupDelivery PickupDelivery_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."PickupDelivery"
    ADD CONSTRAINT "PickupDelivery_pkey" PRIMARY KEY (id);
 P   ALTER TABLE ONLY public."PickupDelivery" DROP CONSTRAINT "PickupDelivery_pkey";
       public            postgres    false    239                       2606    35996 "   PickupLocation PickupLocation_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."PickupLocation"
    ADD CONSTRAINT "PickupLocation_pkey" PRIMARY KEY (id);
 P   ALTER TABLE ONLY public."PickupLocation" DROP CONSTRAINT "PickupLocation_pkey";
       public            postgres    false    255            �           2606    33505 *   ProductTranslation ProductTranslation_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public."ProductTranslation"
    ADD CONSTRAINT "ProductTranslation_pkey" PRIMARY KEY (id);
 X   ALTER TABLE ONLY public."ProductTranslation" DROP CONSTRAINT "ProductTranslation_pkey";
       public            postgres    false    247            �           2606    17092    Product Product_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);
 B   ALTER TABLE ONLY public."Product" DROP CONSTRAINT "Product_pkey";
       public            postgres    false    221                       2606    33521 8   RailwayStationTranslation RailwayStationTranslation_pkey 
   CONSTRAINT     z   ALTER TABLE ONLY public."RailwayStationTranslation"
    ADD CONSTRAINT "RailwayStationTranslation_pkey" PRIMARY KEY (id);
 f   ALTER TABLE ONLY public."RailwayStationTranslation" DROP CONSTRAINT "RailwayStationTranslation_pkey";
       public            postgres    false    249            �           2606    21237 "   RailwayStation RailwayStation_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."RailwayStation"
    ADD CONSTRAINT "RailwayStation_pkey" PRIMARY KEY (id);
 P   ALTER TABLE ONLY public."RailwayStation" DROP CONSTRAINT "RailwayStation_pkey";
       public            postgres    false    241            �           2606    18185    Review Review_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);
 @   ALTER TABLE ONLY public."Review" DROP CONSTRAINT "Review_pkey";
       public            postgres    false    233            �           2606    21219 $   StationDelivery StationDelivery_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public."StationDelivery"
    ADD CONSTRAINT "StationDelivery_pkey" PRIMARY KEY (id);
 R   ALTER TABLE ONLY public."StationDelivery" DROP CONSTRAINT "StationDelivery_pkey";
       public            postgres    false    237            �           2606    21247    Store Store_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_pkey" PRIMARY KEY (id);
 >   ALTER TABLE ONLY public."Store" DROP CONSTRAINT "Store_pkey";
       public            postgres    false    243            �           2606    17082    Token Token_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public."Token"
    ADD CONSTRAINT "Token_pkey" PRIMARY KEY (id);
 >   ALTER TABLE ONLY public."Token" DROP CONSTRAINT "Token_pkey";
       public            postgres    false    219            �           2606    17072    User User_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
       public            postgres    false    217            �           2606    17038 *   _prisma_migrations _prisma_migrations_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
       public            postgres    false    215            �           1259    21248    AddressDelivery_orderId_key    INDEX     g   CREATE UNIQUE INDEX "AddressDelivery_orderId_key" ON public."AddressDelivery" USING btree ("orderId");
 1   DROP INDEX public."AddressDelivery_orderId_key";
       public            postgres    false    235            �           1259    18190    CartItem_cartId_idx    INDEX     P   CREATE INDEX "CartItem_cartId_idx" ON public."CartItem" USING btree ("cartId");
 )   DROP INDEX public."CartItem_cartId_idx";
       public            postgres    false    229            �           1259    18191    CartItem_productId_idx    INDEX     V   CREATE INDEX "CartItem_productId_idx" ON public."CartItem" USING btree ("productId");
 ,   DROP INDEX public."CartItem_productId_idx";
       public            postgres    false    229            �           1259    17138    Cart_userId_key    INDEX     O   CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");
 %   DROP INDEX public."Cart_userId_key";
       public            postgres    false    227            �           1259    18187    Category_name_key    INDEX     Q   CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);
 '   DROP INDEX public."Category_name_key";
       public            postgres    false    231                       1259    36008    DeliveryCity_postalCode_idx    INDEX     `   CREATE INDEX "DeliveryCity_postalCode_idx" ON public."DeliveryCity" USING btree ("postalCode");
 1   DROP INDEX public."DeliveryCity_postalCode_idx";
       public            postgres    false    253            	           1259    36010     DeliveryCity_postalCode_name_key    INDEX     r   CREATE UNIQUE INDEX "DeliveryCity_postalCode_name_key" ON public."DeliveryCity" USING btree ("postalCode", name);
 6   DROP INDEX public."DeliveryCity_postalCode_name_key";
       public            postgres    false    253    253            
           1259    36009    DeliveryCity_zoneId_idx    INDEX     X   CREATE INDEX "DeliveryCity_zoneId_idx" ON public."DeliveryCity" USING btree ("zoneId");
 -   DROP INDEX public."DeliveryCity_zoneId_idx";
       public            postgres    false    253            �           1259    28230    GuestInfo_email_idx    INDEX     N   CREATE INDEX "GuestInfo_email_idx" ON public."GuestInfo" USING btree (email);
 )   DROP INDEX public."GuestInfo_email_idx";
       public            postgres    false    245            �           1259    28229    GuestInfo_orderId_key    INDEX     [   CREATE UNIQUE INDEX "GuestInfo_orderId_key" ON public."GuestInfo" USING btree ("orderId");
 +   DROP INDEX public."GuestInfo_orderId_key";
       public            postgres    false    245            �           1259    18194    OrderItem_orderId_idx    INDEX     T   CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");
 +   DROP INDEX public."OrderItem_orderId_idx";
       public            postgres    false    225            �           1259    18195    OrderItem_productId_idx    INDEX     X   CREATE INDEX "OrderItem_productId_idx" ON public."OrderItem" USING btree ("productId");
 -   DROP INDEX public."OrderItem_productId_idx";
       public            postgres    false    225            �           1259    18193    Order_status_idx    INDEX     H   CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);
 &   DROP INDEX public."Order_status_idx";
       public            postgres    false    223            �           1259    18192    Order_userId_idx    INDEX     J   CREATE INDEX "Order_userId_idx" ON public."Order" USING btree ("userId");
 &   DROP INDEX public."Order_userId_idx";
       public            postgres    false    223            �           1259    21250    PickupDelivery_orderId_key    INDEX     e   CREATE UNIQUE INDEX "PickupDelivery_orderId_key" ON public."PickupDelivery" USING btree ("orderId");
 0   DROP INDEX public."PickupDelivery_orderId_key";
       public            postgres    false    239                        1259    33506 )   ProductTranslation_productId_language_key    INDEX     �   CREATE UNIQUE INDEX "ProductTranslation_productId_language_key" ON public."ProductTranslation" USING btree ("productId", language);
 ?   DROP INDEX public."ProductTranslation_productId_language_key";
       public            postgres    false    247    247            �           1259    18196    Product_categoryId_idx    INDEX     V   CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");
 ,   DROP INDEX public."Product_categoryId_idx";
       public            postgres    false    221            �           1259    18197    Product_name_idx    INDEX     H   CREATE INDEX "Product_name_idx" ON public."Product" USING btree (name);
 &   DROP INDEX public."Product_name_idx";
       public            postgres    false    221                       1259    33522 0   RailwayStationTranslation_stationId_language_key    INDEX     �   CREATE UNIQUE INDEX "RailwayStationTranslation_stationId_language_key" ON public."RailwayStationTranslation" USING btree ("stationId", language);
 F   DROP INDEX public."RailwayStationTranslation_stationId_language_key";
       public            postgres    false    249    249            �           1259    21251    RailwayStation_city_name_key    INDEX     h   CREATE UNIQUE INDEX "RailwayStation_city_name_key" ON public."RailwayStation" USING btree (city, name);
 2   DROP INDEX public."RailwayStation_city_name_key";
       public            postgres    false    241    241            �           1259    18189    Review_productId_idx    INDEX     R   CREATE INDEX "Review_productId_idx" ON public."Review" USING btree ("productId");
 *   DROP INDEX public."Review_productId_idx";
       public            postgres    false    233            �           1259    18188    Review_userId_idx    INDEX     L   CREATE INDEX "Review_userId_idx" ON public."Review" USING btree ("userId");
 '   DROP INDEX public."Review_userId_idx";
       public            postgres    false    233            �           1259    21249    StationDelivery_orderId_key    INDEX     g   CREATE UNIQUE INDEX "StationDelivery_orderId_key" ON public."StationDelivery" USING btree ("orderId");
 1   DROP INDEX public."StationDelivery_orderId_key";
       public            postgres    false    237            �           1259    18199    Token_token_idx    INDEX     F   CREATE INDEX "Token_token_idx" ON public."Token" USING btree (token);
 %   DROP INDEX public."Token_token_idx";
       public            postgres    false    219            �           1259    18198    Token_token_key    INDEX     M   CREATE UNIQUE INDEX "Token_token_key" ON public."Token" USING btree (token);
 %   DROP INDEX public."Token_token_key";
       public            postgres    false    219            �           1259    18200    User_email_idx    INDEX     D   CREATE INDEX "User_email_idx" ON public."User" USING btree (email);
 $   DROP INDEX public."User_email_idx";
       public            postgres    false    217            �           1259    17137    User_email_key    INDEX     K   CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);
 $   DROP INDEX public."User_email_key";
       public            postgres    false    217                       2606    21252 ,   AddressDelivery AddressDelivery_orderId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."AddressDelivery"
    ADD CONSTRAINT "AddressDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 Z   ALTER TABLE ONLY public."AddressDelivery" DROP CONSTRAINT "AddressDelivery_orderId_fkey";
       public          postgres    false    4823    223    235                       2606    17164    CartItem CartItem_cartId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public."CartItem" DROP CONSTRAINT "CartItem_cartId_fkey";
       public          postgres    false    229    227    4831                       2606    18231     CartItem CartItem_productId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 N   ALTER TABLE ONLY public."CartItem" DROP CONSTRAINT "CartItem_productId_fkey";
       public          postgres    false    229    4821    221                       2606    17159    Cart Cart_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 C   ALTER TABLE ONLY public."Cart" DROP CONSTRAINT "Cart_userId_fkey";
       public          postgres    false    227    4813    217            !           2606    36011 %   DeliveryCity DeliveryCity_zoneId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."DeliveryCity"
    ADD CONSTRAINT "DeliveryCity_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES public."DeliveryZone"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 S   ALTER TABLE ONLY public."DeliveryCity" DROP CONSTRAINT "DeliveryCity_zoneId_fkey";
       public          postgres    false    253    4869    251            "           2606    36016 -   DeliveryTimeSlot DeliveryTimeSlot_zoneId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."DeliveryTimeSlot"
    ADD CONSTRAINT "DeliveryTimeSlot_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES public."DeliveryZone"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 [   ALTER TABLE ONLY public."DeliveryTimeSlot" DROP CONSTRAINT "DeliveryTimeSlot_zoneId_fkey";
       public          postgres    false    251    4869    257                       2606    28236     GuestInfo GuestInfo_orderId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."GuestInfo"
    ADD CONSTRAINT "GuestInfo_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 N   ALTER TABLE ONLY public."GuestInfo" DROP CONSTRAINT "GuestInfo_orderId_fkey";
       public          postgres    false    245    223    4823                       2606    18216     OrderItem OrderItem_orderId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 N   ALTER TABLE ONLY public."OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";
       public          postgres    false    4823    225    223                       2606    18221 "   OrderItem OrderItem_productId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 P   ALTER TABLE ONLY public."OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";
       public          postgres    false    225    221    4821                       2606    28231    Order Order_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 E   ALTER TABLE ONLY public."Order" DROP CONSTRAINT "Order_userId_fkey";
       public          postgres    false    217    4813    223                       2606    21267 *   PickupDelivery PickupDelivery_orderId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."PickupDelivery"
    ADD CONSTRAINT "PickupDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 X   ALTER TABLE ONLY public."PickupDelivery" DROP CONSTRAINT "PickupDelivery_orderId_fkey";
       public          postgres    false    239    4823    223                       2606    21272 *   PickupDelivery PickupDelivery_storeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."PickupDelivery"
    ADD CONSTRAINT "PickupDelivery_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 X   ALTER TABLE ONLY public."PickupDelivery" DROP CONSTRAINT "PickupDelivery_storeId_fkey";
       public          postgres    false    239    243    4857                       2606    33507 4   ProductTranslation ProductTranslation_productId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."ProductTranslation"
    ADD CONSTRAINT "ProductTranslation_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 b   ALTER TABLE ONLY public."ProductTranslation" DROP CONSTRAINT "ProductTranslation_productId_fkey";
       public          postgres    false    247    4821    221                       2606    18226    Product Product_categoryId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 M   ALTER TABLE ONLY public."Product" DROP CONSTRAINT "Product_categoryId_fkey";
       public          postgres    false    231    221    4839                        2606    33523 B   RailwayStationTranslation RailwayStationTranslation_stationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."RailwayStationTranslation"
    ADD CONSTRAINT "RailwayStationTranslation_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES public."RailwayStation"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 p   ALTER TABLE ONLY public."RailwayStationTranslation" DROP CONSTRAINT "RailwayStationTranslation_stationId_fkey";
       public          postgres    false    249    241    4855                       2606    18241    Review Review_productId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 J   ALTER TABLE ONLY public."Review" DROP CONSTRAINT "Review_productId_fkey";
       public          postgres    false    233    221    4821                       2606    18236    Review Review_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 G   ALTER TABLE ONLY public."Review" DROP CONSTRAINT "Review_userId_fkey";
       public          postgres    false    217    4813    233                       2606    21257 ,   StationDelivery StationDelivery_orderId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."StationDelivery"
    ADD CONSTRAINT "StationDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 Z   ALTER TABLE ONLY public."StationDelivery" DROP CONSTRAINT "StationDelivery_orderId_fkey";
       public          postgres    false    223    237    4823                       2606    21262 .   StationDelivery StationDelivery_stationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."StationDelivery"
    ADD CONSTRAINT "StationDelivery_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES public."RailwayStation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 \   ALTER TABLE ONLY public."StationDelivery" DROP CONSTRAINT "StationDelivery_stationId_fkey";
       public          postgres    false    4855    237    241                       2606    17139    Token Token_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Token"
    ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 E   ALTER TABLE ONLY public."Token" DROP CONSTRAINT "Token_userId_fkey";
       public          postgres    false    219    217    4813            �   N   x�3�44�t�+���KUN�IL���4���t.J�+Vs�44���4202�54�50V04�25�25�35�!����� $      �      x������ � �      �      x������ � �      �   �   x���Mn�0���)|�D�qd�kt��^�@ժR�6e�L�O�O�������%K�g����^����\�|b�č�<>O�|�ǵS�A���EWy#��G��VX!�Tf�'�n��w�Fޱ#=�6�&vh\VxWx��|���@a�0fܾ�cף�Yu!��6|�q�3D���A&,j��&��־!��UB���>���N�ȭں]����Z%w�\?�Z�?���      �     x���Kr�H���)r��/�;���x�T��TV�a���*��"E�(Ǚ���� -�y�7Z`����P���u�B�e����,t�ݪt+U�R�q�������Q�:v}گ�iX�6�ؤQ/hQT3a0(����ڴ�#JT��c�8XT����/$�.$g�88]�����U��U+.Xc�9��D�/�x.5�<�R	NTa�f�S�3An�a�h4 R��Ф/l))Y�Kǀ*3q3���䘺�"��]?�����WsqPD�zhǱ��hyl&pqP������jD�$%�,�U�l�9���q8�7��c�ue�-3�C ��v6�g�������C�b���\Ȏ���I���@Ff�2d=(����{l7���7����%xg#��.9f��Mpۧ�jӵ,�X������}�ov15�
�����1,W��<��qx.P��1�s5�s�v�*�o�w	�@�*��>�*U�(x�]��E��;=mvG���3�y*��|��I��U�����>�����&'��e�0�����pN��2�ڱ��l��㪘�T5�����O�����{�܃�-;�2�N��zċO�ׯ�ū.�ֻӿ{|�IU�eϼ�����d��`h���As�w1��b���{0�L|W�}K��/�2����Y���q�	�h�G-���y�∳�Ͱ��D���F{�5_��ym&�˳!A�̈́��[�^��4*h��ě�	�Z��`����8�%[L`<&T`�g�\٥��Flt����眂�f�r�8��+�դ����ԝ�B�%���a���J���e��88�˽�%���m�5�ZΎ���88�戢YS�}�Z�"���y)15�?� Cf*
�����S�ky�j8�����I�ZˏQP�F�qp�Ɏ�����l$.���I��յ���tP(���aϬ�|mb�l~xfu�V��g>0}`�71�s�e?�'&Ɓ�;�j�8l�H=00X�s�=��V�~��M����T�fl6Q���R���2L����^���.���k���+ �b��      �   �   x����
�0�s���Ҥ�6�v��	�xpc0*����΃B���>�4�iN�t��s@~���z`�R:)�)�^Z�����#�鶌s���K��x+G�k���vyM���Yy��ČQ%�X[X�V�t��|���8�\C%+ǐCͦjlD=F8�x47�b���Ԍi�T+ǾB���"      �   b   x�3�K,M�s�
ɉy%�y
)�9�e�E�
U�y��f�FF�����f
��VƦV�&z&�F�Ĺ�8�S�R�9�]�,�&b5����8W� K,�      �   �   x���1
1��:s
/`ț�l���m��FDDTw��Fm�"� ��7!pHn����8����tz���=���zq�(ڥ�8���H�PL�^�ى�[�Q�����};`"��:E�2��d�D�l
_Bnuzݘ��G��V�=��N�ӟ�r	#J-�q硱թ�)�5ɐ=�NODO����      �   �  x��Xm�#E�<�+����t�{Ϸ�5xf�l�P$l��&�ެ��	~D�T=�ϋ��r/��󏬞��&�陬�0�����z��"����%ۭ�7����k��[흄3��lqG��B��SimٮRɩQ2�kww:�ד�����l���^�GCr:�sr�%��^��߼�A����Tr��"���O�'�����c����?%��?�>�~1�ܟ�gӯ��_�o�ʧpc���ӥ׆�	�D���ou���K�T�T1����+w�W���*8K����Sn)��/z�:7o��}���wv��0t���bAaRf���Q�AbC�I6C�Ӿ�y�ݛeG�D�y!�r��:HqN�,�O�|�-��9�_��C���y��_��s��������׋�|�A�}
΅��d�#���d0��Srrw8�0W�	ᛯ���P,�i��Z
�BQ�����D�5�4a�UK�������?A?����Ic��e�q�s<���F�r�M� ��U	Xx!](��J C�CB��S)mԾR%`��g��G����OLbtU��-�C3�)��D�1�j�K�k �s>��F�+���"
��ќO�sf�f�K1�����vvz���K����4.�X� �:ɣ���\���@D*m��:f����p�I\B�G�J��)����G+ Q)C�B�P"j_	_	I�.KaN�����D_�Zu�Q�p)C�q1�zܪ�E��T�&X�a�*a�"�F�-wZe����19�p0�3�;J�� �yGɴ�)�JŃ��͖�"(�B����������Y(^y���D!��Iv���� ;��ɽ�8.NP�F��K11�F���6E�F��2���/&���<�����-C��<V�� �@*R���K�+�dy�	�iR�[���C�
�ZGA���Jg�S>}8}���畽&IoԒ�0m�<v҆��K 1v�)��c�H@ʚn.`�!�C��a#`o�ѢJ�16ro�Y�  ŲЉ+&�t(t+ˊt&?TzSA�P�z�v/ �\�]�)K�">?0�~����b�f�&�a.�[*uZ4-u�<+=2X�87y�ጹtv�=#���:ljID�c�
͘(����ܣ-�}�|��+҉���U���3�6����䆨h      �   �   x�U��� CϦ�<���鿎����)��F�2���e����FRq1���P���-*��<���S�y��Ev��n���n�I����K��SVƍ\`�jB�k���ȥ�-��gB�p�,_
�)dC`<�BI0Q}$8��������ԍ\�NvƏ�����'y�o䋜7q�u6d����Wdׁ�f�x `�0��G=����GP���u_�(���oU����� g�����	k      �   �   x�u��m�0�bn�W�R-鿎��H���u�i,�����r�L�m�1=��)a��q�&�Q�I|r�~T6��|���q�&���U�yW��aI��vz�qK՗�S�Lv�;�z<R�xQŢ��=l8D��L��`2�;�)]T2k�NW��ڔ���SS�����w�3�`�qȒ�ťT.��k���;��;y��O�����n;9I�_W^1��_]�5�<]'t�;_ ߞY��      �   ~   x�3�����S.�/J��
�))E���
�@!�,�����RuL��[���y 6H��� $���9�ũPq#�x-H\�F�j4#Gc������������������������!.q�=... �}Y�      �   z	  x��Zmo��|�E%@w�}��o闢iAc�Χ@�$*�
R�tǍ�}���$S�H�/��������w|�d�H��{s���<��E�����7��~������w������a�tͿ����x}����[��n�S��-����3�|��R�/;i��{�ğ�O`�V����?�������F
��|:����XN�]��N�Ń�~�ٯ?y���>����<~���vV[[��RJ�9�����Kg�"��j�����?���u&D��+g;�2&�Q��b�'N��	)xN��m�o�
%a�+�.�i��L�ʋ"��c�)/Zʴ��-S�q�2K�67	O'��b�ox����0�S>K����Ʌ�h+�R�c� ����%�?.�~P���5"����צ���`��Sn�Ky#=���<H�C\*��4\&&��*0l=�)ځ��^Z�����c��
� �X���Կ]O������=��o0����l΁]�a\΢�ޟB�¾�i����W�
�q 2�kO(V[e{}a�ι�͌v�*aM�e��J4`�Z´
��p�,?���D��|�q�v � �>o�g�7�83�5�YHo�&����M��J��������8^T&P"�!�K#�%\h�������o=N�\�,w!��J*�	���X-���./��RX!2#��N�%5���dV��b�J�5�pPXӁe�\��%T�0��z2����˙e� �"@11�ZTrkUIG9I�e�_���h�EEMAn�~��P�aj�F���$�8Zy5X"c����1k�f�S����Z�4�Y��M��;'�6+g[�2.�2\�[5�I��
��j�-��d!�p��tĲBe�AC:�W
Cͧ(�I�^.P�m�bf���*Ә����9�slß$%��@��@����t+�aM qx?�+N����IXC��������5��mb�ʢg`d�w�т1:ȩ���V���9ɶ
�,f�]��!
�C�^(��ً@�;��5����w�xRqx?���%^9�YX�T��rz����`=�M�hF�|�=E7��?����'	9}{t8f��/���a��w��a�nJcV&�؀��lI�o�q���X��ғ��̄VN<��)a�TJpۂ�,\#%ne����3��Q�E<9/�	!�5�H2B�`|�"`姘�!H�D�ᮏ�����Bb��C֠]�r��0L�&�S�@�&P���@�|,�6��Γ�X����
;(��Sj^��b�b�ă��*�)�Kp��fu��Iq�Ü��>�E��Ļw�uNR�vHn�<Q���PT�2:pD;���~F-��x�JB�� �Uq����d����_��߱�HF���Pc���awF������i'4.h�c��#��Ʊj�T/�r���N�LE�-(��|���N�$8&l�9�p���qj�;&���������UF�MB��J����b�#ʸ�+}��D���׀j�.��>alH���Ef7:p��X��i�r��G������
���A��1��45&k8��|��Ė�XҧR���	�*w5��?x��Z	��<�ʢ�*r�6Z�%�F����Vl
��]�/a�v�Tt�Fi��F�sn�L����H�ikq#�+��gJ��7\y�Dh��s�R�{ieMߟY%(怜yM�a%�/g2$������BA�ڗ__�,�D�B����u�g�^��<�[*�AL���S�L��Bu���Oݽ*��i,y3�x��k�o���c�^��u�iG�A�PɔcLC#�ÄNc����#�Z�L���(�N�4B��>Q�d�҃��*�����%��7 �/��GɆ(���
	�F���GQ����g�&���R���[��Q�|7�wwr �V�tg�7r��©y������@�]�%jEΪ`1�T��y�kZrڟ����1��C]y"�������OJ�;zL�.�p�D=/�w�o*�(���d��+��DK�^�5Ч��i���" 8]X��Vq���ȥ����Xg��\.��z��1>���[_��xD�W��<	�h�V3�.��ˈ�ņ&��@��KN2�i��tCY��qI��� ͹�C�: hĪ��|AgLLbb:(����z��|6��6�Ɛ�s�j:�س��>�E�<	8�5��Zᎄ��\8Q�L�B	�B���ʜ}R�E�(Oƺ���[�|��k�m������H�"����R�iej�oKn����;8ء�������*6����uȭ��0Fҩ�jԒ�-���F��U�t���x��p^;y�s�U��i�O���-b	�G�W5��r��H���k��_�����?�>kU      �      x������ � �      �     x����JAE�ٯ�p&��̼��2
���U������݀������(�o��Y#B*�[\Ns׊�rޔu]m
߇^����-��),Ҙ�~'"~�W~�B�������e��u�
Ѵe{1��dF{��[gQc9�N�j�@jJ
g
������qBbwV�Mz�'���_-{?5!' k<�ʝ5ڢOG�:��@��I�m�Qӈ�I�Ϊ���ߣ6�D:��DҨu\O�ѯ�>��wR;	ة�"�Nu��$� ���       �   �   x�M��
�0���)ns��T�����%�)���6G�8����V��X��\��Ԃ�q��}�>	2��JD�!c�:���Ha�y�|���9����	e#Ê��U���ǁ %a��6��Rr2l�~�6�lE��cv���'}�JK}��:S_�����oz�O,��B��[��y�R��W)      �      x������ � �      �     x�u�[�!�en���Zf��LO�v{c�WK�#4Y� �v���a���2��8q���t��Ÿ02���T7kY�Q�T'N���*��ꙧ�tn���%��h.�����l�8Մ��K������49qj	�N���<�be�8q�Qy�*ʵ�*�[� Ft��`S��lWE6jL���S�C�Th�*�5rN����XE�Cd/��E���8A��;��K���`/sډS|�O�XV�\�ꦥ��8�R|}�K<ֿ�~�.f(b����/p��      �   w   x�3�0���x���*\lV����t�H���SHIU(J�u�I--��Q0�K�p��q^켰�{/�+X�� IN##]C#]cC#+CC+s=C#K\�\1z\\\ ��+�      �      x������ � �      �   K  x���Yo�H��ɯ�Zy�\�S�ml�`�6��҈ 1;��n��N:K73�J�[������ ,4S����rx��NcaBE&�
���2��-�n�ed�u6��m��P�;�{n��a==�����6��\���mC��;�\CT!�B��T���x;ϯ�*�N�'/Ӻ����%El�=����+��k�<6�����Xk�F1!c�Xuc��[�hf�z�F��=�%�"��\�W1�k�?�%�9sYb"%}��;D�3��*�9�C�M�N���Sㄣa����:Y���������8qy�2~���5�.�T2��L�wEb	#?Ӄ%����:�����t�a '|��R���8V���l���ܛjV�
����q�
�}�#5�,+��X�^�-�	�;ۍu�V��߱aKݴ�)h��K#y�
RÁ�65�Yg!wdy�7A
��J�R�l�(��0OwBo�g�ẇ��W��0{4�9��3?�����6`��!��֖�'�;qwu��S��Ɓ7���x�����(��z%�$,���[���r!(w+L�~q�w qs�/�j�2'�}f_j4�M/�f�	綵��=�h���_�T���<����a���j���1TCRيK���+�Jv��~>�v���2�J�gt�E��<f�;<�N��޳�&����]��]��n�sm�٧tŒP���LINT>*2(�*ɓ}	cU����ߓ�:Շ����|Sj䟟�����Ҥw�>�p0�N�fQ=5�#L�ks�9?S=l.�85���T7�Q'�^I��,J�p�!*+"�,����������_����      �   �  x��V�n����~����=c��C�	*��� �IDH{��g}@wH�-)�����YS��%�L1d������j�K=ۮdQSZ��hu�a;K�k�l-n�[Q��<��6S�%ę}����9�>�OTߓ�'�9��]��$�d;��O�ݯ�l�~���c�e�}�I����5djl2�:�V�w���6'��,@�<�{=)~�$�5+�;|��d5R��.�$�H�O�;�ر�q<�?N��㥶��O$��O�)�I̽������\��5��%����HUj������UɌG���:�JxB#�^ȕ�yZ�s]{�%��������ߑHRJF�"����<�u��O�>�|)��j9��p�4�x�=[���Whc���{�cg}��0�R#z\T�Fg��\��2g��b�}���_J)����6Ҩ�=>���H�b�����o��r���!;Ϸ���=V�Y�l��[#������B�n�j��&4�xg�͒d0�a��� �Z�+��,,D3���u��Gպ�{"&K�|_b���AQ�Z%�}&���rzy~��汎�r�rC#�l$[(ځ&�- ��:G���9v�d���3�YJc�J,qe�9�U�WZ�#U�$g�B��?u�98�5)<�	g�����<���￷y>�K����X���!�����>��l�-� �"-q�]k�)z)���ս״�TR�H�J@!ܐ^�	9�"���{�>d"�yO��"�(%����e���q������S��XoP�S���r,1Na	,^�0�˃gM�%w-5[�#qȴQrB�^&1m�)"Č�yvw1���@�6�D�H$eh5q�"��}�]���%�ލ��e6:��%���FL�}�W!y��+3x;�6��b�2Z-û��R����X��L
��f�H�̏.0M>����K�$�Ě���	H��q|~��֩_��CU�I�y@+�j�ui$��8x���5�U�h�i���"낻 jH,6��*��A�pN���|�G�6��t��`K��Ds�_���<�<��>�����6����v[��z�)���鲀���\�P��s���Оc�ء��	�b�ઽ�PXǦ�rs��Ij��X�Yߤ_"�����r:���z���7�u�cG ����E�P��Ua�\�`a$E̵��I�*BV�p��n�4Y{l#[�b�N�2S���M:��0�j"�R#v�(����E�G�d>�*�!M��O�p9�緧�)�/��zC$U�B�|�ma!����q)�vB��8.�h�'���J�6t���UE�mQ�Ѣ#�K*��?@�XTwB��|�������us��lED��8�(ީ�q���.O�7�v	�-�wأ��Gt*x�'��B@.���ܐO�㖋�:	8�db�>^<Ml��$��9��\OO��m����د�o߾�X�٤     
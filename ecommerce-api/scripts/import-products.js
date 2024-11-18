import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const productsData = [
    {
        "id": 1,
        "image": "/assets/products/tvorog2.png",
        "title": "СИР КИСЛОМОЛОЧНИЙ (ТВОРОГ)",
        "weight": "0,5 кг",
        "description": "Сир натуральний зі швейцарського молока, вироблений на фермі",
        "description-full": "Сир натуральний зі швейцарського молока, вироблений на фермі. Жирність 15%. значок - Фермерський продукт.",
        "umovy": "10 днів у холодильнику (3-5 град С)",
        "recipe": "Продукт готовий до споживання або приготування страв",
        "price": 10
    },
    {
        "id": 2,
        "image": "/assets/products/tvorog4.png",
        "title": "ЙОГУРТ натуральний",
        "weight": "0,5 кг",
        "description": "Йогурт натуральний з ферми (без додавання начинок та цукру)",
        "description-full": "Йогурт натуральний з ферми (без додавання начинок та цукру). Фермерський продукт.",
        "umovy": "21 день у холодильнику (3-5 град С)",
        "recipe": "Продукт готовий до споживання або приготування страв",
        "price": 10
    },
    {
        "id": 3,
        "image": "/assets/products/tvorog3.png",
        "title": "ЙОГУРТ натуральний",
        "weight": "0,2 кг",
        "description": "Йогурт натуральний з ферми (без додавання начинок та цукру)",
        "description-full": "Йогурт натуральний з ферми (без додавання начинок та цукру). Фермерський продукт.",
        "umovy": "21 день у холодильнику (3-5 град С)",
        "recipe": "Продукт готовий до споживання або приготування страв",
        "price": 4
    },
    {
        "id": 4,
        "image": "/assets/products/syrnyki2.png",
        "title": "СИРНИКИ",
        "weight": "0,5 кг",
        "description": "Ніжні сирники з натурального сиру, в міру солодкі",
        "description-full": "Ніжні сирники з натурального сиру, в міру солодкі.",
        "umovy": "60 днів у морозильці",
        "recipe": "Готувати одразу діставши з морозилки: розігрійте пательню, смажте на середньому вогні по 5-7 хвилин з кожного боку, потім збішіть вогонь та смажте до утворення золотистої скоринки (на свій смак)",
        "price": 15
    },
    {
        "id": 5,
        "image": "/assets/products/syrnyki1.png",
        "title": "ВАРЕНИКИ з начинками в ассортименті",
        "weight": "0,5 кг",
        "description": "вареники українські з різними начинками на ваш вибір",
        "description-full": "Вареники українські з різними начинками на ваш вибір",
        "assortment": [
            "вареники з ніжним натуральним сиром, в міру солодкі",
            "вареники з вишнею, в міру солодкі",
            "вареники з м'ясом  (фарш свино-яловичий)",
            "вареники з картоплею, смаженими грибами та луком (гриби шампіьйони)",
            "вареники з тушкованою капустою та грибами (шампіьйони)"
        ],
        "umovy": "60 днів у морозильці",
        "recipe": "Готувати одразу діставши з морозилки: у киплячу воду у кастрюлі варити 10-12 хвилин (до готовності м'яса), додати сіль за смаком. Злити окроп, додати вершкове масло та сметану.",
        "price": 35
    },
    {
        "id": 6,
        "image": "/assets/products/pelmeni1.png",
        "title": "ПЕЛЬМЕНІ",
        "weight": "1 кг",
        "description": "пельмені з м'ясом  (фарш свино-яловичий)",
        "description-full": "пельмені з м'ясом  (фарш свино-яловичий)",
        "umovy": "60 днів у морозильці",
        "recipe": "Готувати одразу діставши з морозилки: у киплячу воду у кастрюлі варити 10-12 хвилин (до готовності м'яса), додати сіль за смаком. Злити окроп, додати вершкове масло та сметану.",
        "price": 35
    },
    {
        "id": 7,
        "image": "/assets/products/golubtsy.png",
        "title": "ГОЛУБЦІ",
        "weight": "1 кг",
        "description": "голубці з м'ясом  (фарш свино-яловичий)",
        "description-full": "голубці з м'ясом  (фарш свино-яловичий)",
        "umovy": "60 днів у морозильці",
        "recipe": "Налийте в каструлю достатню кількість води і розчиніть у ній натуральну томатну пасту, додайте сіль, перець та спеції на свій смак. Покладіть голубці прямо з морозилки у каструлю, доведіть до кипіння, а потім тушкуйте на середньому вогні 40-50 хвилин, доки капуста не стане м'якою. Подавайте гарячими зі сметаною",
        "price": 35
    },
    {
        "id": 8,
        "image": "/assets/products/golubtsy.png",
        "title": "МЛИНЦІ з начинками в асортименті",
        "weight": "0.5 кг",
        "description": "млинці смажені з різними начинками на ваш вибір",
        "description-full": "млинці смажені з різними начинками на ваш вибір",
        "assortment": [
            "млинці з ніжним натуральним сиром, в міру солодкі",
            "млинці з м'ясом та грибами (фарш свино-яловичий, гриби шампіьйони)",
            "млинці з м'ясом  (фарш свино-яловичий)",
            "млинці зі смаженими грибами та луком (гриби шампіьйони)"
        ],
        "umovy": "60 днів у морозильці",
        "recipe": "Розморозити за декілька годин до споживання. Можна вживати підігрітим у мікрохвильовці або на пательні. Для утворення скоринки - підсмажте на вершковому маслі з обох боків на середньому вогні",
        "price": 30
    },
    {
        "id": 9,
        "image": "/assets/products/tvorog4.png",
        "title": "СИРНА МАСА ванільна",
        "weight": "0.5 кг",
        "description": "ніжна сирна маса ванільна солодка з натурального сиру",
        "description-full": "ніжна сирна маса ванільна солодка з натурального сиру.",
        "umovy": "10 днів у холодильнику (3-5 град С)",
        "recipe": "Продукт готовий до споживання. ",
        "price": 10
    },
    {
        "id": 10,
        "image": "/assets/products/syrki2.png",
        "title": "СИРКИ В ШОКОЛАДІ",
        "weight": "4 шт",
        "description": "сирки ванільні солодкі з натурального фермерського сиру, вкриті шоколадом",
        "description-full": "сирки ванільні солодкі з натурального фермерського сиру, вкриті шоколадом (молочним, білим або чорним)",
        "assortment": [
            "сирки ванільні у молочному шоколаді",
            "сирки ванільні у чорному шоколаді",
            "сирки з карамеллю у молочному шоколаді",
            "сирки з получним конфітюром у білому шоколаді"
        ],
        "umovy": "10 днів у холодильнику (3-5 град С / 30 днів у морозильці)",
        "recipe": "Розморозити за декілька годин до споживання.",
        "price": 20
    },
    {
        "id": 11,
        "image": "/assets/products/syrki2.png",
        "title": "ВАФЕЛЬНИЙ ТОРТ з вареною ЗГУЩЕНКОЮ",
        "weight": "1 шт",
        "description": "Вафельний торт з вареною згущенкою",
        "description-full": "Вафельний торт з вареною згущенкою – це в міру солодкий десерт з ніжними хрусткими коржами, просоченими ароматною карамельною згущенкою, яку ми готуємо самостійно з молока з ферми.",
        "assortment": [],
        "umovy": "10 днів у холодильнику (3-5 град С / 30 днів у морозильці)",
        "recipe": "Продукт готовий до споживання.",
        "price": 20
    }
];

async function createCategories() {
    const categories = [
        {
            name: 'Молочні продукти',
            description: 'Натуральні молочні продукти з ферми'
        },
        {
            name: 'Заморожені продукти',
            description: 'Заморожені напівфабрикати власного виробництва'
        },
        {
            name: 'Десерти',
            description: 'Солодощі власного виробництва'
        }
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }

    console.log('Categories created successfully');
}

async function getCategoryForProduct(product) {
    // Логика определения категории на основе характеристик продукта
    if (product.umovy.includes('морозильці')) {
        return await prisma.category.findFirst({
            where: { name: 'Заморожені продукти' }
        });
    } else if (product.title.includes('ТОРТ') || product.title.includes('ШОКОЛАДІ')) {
        return await prisma.category.findFirst({
            where: { name: 'Десерти' }
        });
    } else {
        return await prisma.category.findFirst({
            where: { name: 'Молочні продукти' }
        });
    }
}

async function importProducts() {
    try {
        // Очищаем существующие продукты
        await prisma.product.deleteMany({});
        console.log('Existing products cleaned');

        // Создаем категории
        await createCategories();

        // Импортируем продукты
        for (const product of productsData) {
            const category = await getCategoryForProduct(product);
            
            const productData = {
                name: product.title,
                description: product.description,
                descriptionFull: product['description-full'],
                price: parseFloat(product.price),
                weight: product.weight,
                image: product.image,
                images: [product.image],
                umovy: product.umovy,
                recipe: product.recipe,
                assortment: product.assortment || [],
                stock: 100,
                categoryId: category.id,
                isActive: true
            };

            const createdProduct = await prisma.product.create({
                data: productData
            });

            console.log(`Created product: ${createdProduct.name}`);
        }

        console.log('Products import completed successfully');
    } catch (error) {
        console.error('Error during import:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Запускаем импорт
importProducts()
    .then(() => console.log('Import script completed'))
    .catch(error => {
        console.error('Import script failed:', error);
        process.exit(1);
    });
/**
 * Seed script to assign products to their correct categories based on product name keywords.
 * Run with: npx ts-node --transpile-only -r tsconfig-paths/register prisma/seed-categories.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all categories
  const categories = await prisma.productCategory.findMany();
  const catMap = new Map(categories.map((c) => [c.name, c.id]));

  const getCategoryId = (name: string): string => {
    const lower = name.toLowerCase();

    // milk products
    if (
      lower.includes('milk') ||
      lower.includes('cheese') ||
      lower.includes('yogurt') ||
      lower.includes('yoghurt') ||
      lower.includes('butter') ||
      lower.includes('cream') ||
      lower.includes('curd') ||
      lower.includes('quark') ||
      lower.includes('mozzarella') ||
      lower.includes('ricotta') ||
      lower.includes('camembert') ||
      lower.includes('raclette') ||
      lower.includes('fondue') ||
      lower.includes('käse') ||
      lower.includes('milch')
    )
      return catMap.get('milk')!;

    // fruit
    if (
      lower.includes('apple') ||
      lower.includes('pear') ||
      lower.includes('cherry') ||
      lower.includes('plum') ||
      lower.includes('apricot') ||
      lower.includes('peach') ||
      lower.includes('berry') ||
      lower.includes('strawberry') ||
      lower.includes('raspberry') ||
      lower.includes('blueberry') ||
      lower.includes('blackberry') ||
      lower.includes('grape') ||
      lower.includes('currant') ||
      lower.includes('gooseberry') ||
      lower.includes('elderberry') ||
      lower.includes('fruit') ||
      lower.includes('obst') ||
      lower.includes('beeren') ||
      lower.includes('frucht') ||
      lower.includes('juice') ||
      lower.includes('saft') ||
      lower.includes('most') ||
      lower.includes('cider') ||
      lower.includes('compote') ||
      lower.includes('marmalade') ||
      lower.includes('jam') ||
      lower.includes('konfitüre') ||
      lower.includes('dried fruit') ||
      lower.includes('dörrobst') ||
      lower.includes('nuts') ||
      lower.includes('walnut') ||
      lower.includes('hazelnut') ||
      lower.includes('almond') ||
      lower.includes('chestnut') ||
      lower.includes('nüsse') ||
      lower.includes('nuss') ||
      lower.includes('williams') ||
      lower.includes('quince') ||
      lower.includes('quitten') ||
      lower.includes('kiwi') ||
      lower.includes('banana') ||
      lower.includes('orange') ||
      lower.includes('lemon') ||
      lower.includes('zitrone') ||
      lower.includes('apfel') ||
      lower.includes('birne') ||
      lower.includes('pflaume') ||
      lower.includes('zwetschge') ||
      lower.includes('marille') ||
      lower.includes('pfirsich') ||
      lower.includes('kirsche')
    )
      return catMap.get('fruit')!;

    // vegetable
    if (
      lower.includes('salad') ||
      lower.includes('lettuce') ||
      lower.includes('cabbage') ||
      lower.includes('kohl') ||
      lower.includes('carrot') ||
      lower.includes('rüebli') ||
      lower.includes('potato') ||
      lower.includes('kartoffel') ||
      lower.includes('tomato') ||
      lower.includes('tomate') ||
      lower.includes('cucumber') ||
      lower.includes('gurke') ||
      lower.includes('zucchini') ||
      lower.includes('onion') ||
      lower.includes('zwiebel') ||
      lower.includes('garlic') ||
      lower.includes('knoblauch') ||
      lower.includes('pumpkin') ||
      lower.includes('kürbis') ||
      lower.includes('squash') ||
      lower.includes('pepper') ||
      lower.includes('paprika') ||
      lower.includes('spinach') ||
      lower.includes('spinat') ||
      lower.includes('broccoli') ||
      lower.includes('cauliflower') ||
      lower.includes('blumenkohl') ||
      lower.includes('celery') ||
      lower.includes('sellerie') ||
      lower.includes('leek') ||
      lower.includes('lauch') ||
      lower.includes('asparagus') ||
      lower.includes('spargel') ||
      lower.includes('radish') ||
      lower.includes('rettich') ||
      lower.includes('beetroot') ||
      lower.includes('randen') ||
      lower.includes('rübe') ||
      lower.includes('bean') ||
      lower.includes('bohne') ||
      lower.includes('pea') ||
      lower.includes('erbse') ||
      lower.includes('lentil') ||
      lower.includes('linse') ||
      lower.includes('mushroom') ||
      lower.includes('pilz') ||
      lower.includes('champignon') ||
      lower.includes('herb') ||
      lower.includes('kraut') ||
      lower.includes('basil') ||
      lower.includes('parsley') ||
      lower.includes('petersilie') ||
      lower.includes('chive') ||
      lower.includes('schnittlauch') ||
      lower.includes('rhubarb') ||
      lower.includes('rhabarber') ||
      lower.includes('corn') ||
      lower.includes('mais') ||
      lower.includes('artichoke') ||
      lower.includes('artischocke') ||
      lower.includes('eggplant') ||
      lower.includes('aubergine') ||
      lower.includes('vegetable') ||
      lower.includes('gemüse') ||
      lower.includes('gemuese') ||
      lower.includes('wild garlic') ||
      lower.includes('bärlauch') ||
      lower.includes('sour') ||
      lower.includes('sauerkraut') ||
      lower.includes('garden') ||
      lower.includes('garten') ||
      lower.includes('chicory') ||
      lower.includes('chicorée') ||
      lower.includes('endive') ||
      lower.includes('batavia') ||
      lower.includes('lollo') ||
      lower.includes('rucola') ||
      lower.includes('ruccola') ||
      lower.includes('sugarloaf') ||
      lower.includes('zuckerhut') ||
      lower.includes('patisson') ||
      lower.includes('olive') ||
      lower.includes('parsnip') ||
      lower.includes('pastinake')
    )
      return catMap.get('vegetable')!;

    // honey
    if (
      lower.includes('honey') ||
      lower.includes('honig') ||
      lower.includes('bee') ||
      lower.includes('biene') ||
      lower.includes('propolis') ||
      lower.includes('pollen')
    )
      return catMap.get('honey')!;

    // egg
    if (
      lower.includes('egg') ||
      lower.includes('ei') ||
      lower.includes('eier') ||
      lower.includes('pasta') ||
      lower.includes('noodle') ||
      lower.includes('nudel')
    )
      return catMap.get('egg')!;

    // meat
    if (
      lower.includes('meat') ||
      lower.includes('fleisch') ||
      lower.includes('beef') ||
      lower.includes('rind') ||
      lower.includes('pork') ||
      lower.includes('schwein') ||
      lower.includes('chicken') ||
      lower.includes('huhn') ||
      lower.includes('hähnchen') ||
      lower.includes('hahn') ||
      lower.includes('turkey') ||
      lower.includes('pute') ||
      lower.includes('lamb') ||
      lower.includes('lamm') ||
      lower.includes('veal') ||
      lower.includes('kalb') ||
      lower.includes('sausage') ||
      lower.includes('wurst') ||
      lower.includes('ham') ||
      lower.includes('schinken') ||
      lower.includes('bacon') ||
      lower.includes('speck') ||
      lower.includes('venison') ||
      lower.includes('wild') ||
      lower.includes('hirsch') ||
      lower.includes('alpaca') ||
      lower.includes('buffalo') ||
      lower.includes('büffel') ||
      lower.includes('goose') ||
      lower.includes('gans') ||
      lower.includes('duck') ||
      lower.includes('ente') ||
      lower.includes('rabbit') ||
      lower.includes('kaninchen') ||
      lower.includes('horse') ||
      lower.includes('pferd') ||
      lower.includes('steak') ||
      lower.includes('bratwurst') ||
      lower.includes('cervelat') ||
      lower.includes('landjäger') ||
      lower.includes('jerky') ||
      lower.includes('trockenfleisch') ||
      lower.includes('bündnerfleisch')
    )
      return catMap.get('meat')!;

    return catMap.get('other')!;
  };

  // Get all products
  const products = await prisma.product.findMany();
  let updated = 0;

  for (const product of products) {
    const categoryId = getCategoryId(product.name);
    if (categoryId !== product.categoryId) {
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId },
      });
      updated++;
    }
  }

  console.log(`✅ ${updated} of ${products.length} products updated with correct categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
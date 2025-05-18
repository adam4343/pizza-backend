import { db } from "./db";
import {
  pizza,
  ingredient,
  attribute,
  pizzaVariation,
  additionalIngredient,
  pizzaToIngredients,
  pizzaToVariations,
  pizzaVariationToAttribute,
  pizzaVariationToIngredients,
  pizzaVariationToAdditional
} from "./db/schemas/pizza.schema";
import { generateUniqueId } from "./lib/helpers";

async function seed() {
  const ingredientNames = ["Cheese", "Tomato Sauce", "Pepperoni", "Mushrooms", "Olives", "Onions", "Basil"];
  const ingredientsData = ingredientNames.map(name => ({
    id: generateUniqueId(),
    name,
    isRemovable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  await db.insert(ingredient).values(ingredientsData);

  const additionalData = [
    { id: generateUniqueId(), name: "Cheese side", price: 1.5, image: "https://cdn.dodostatic.net/static/Img/Ingredients/99f5cb91225b4875bd06a26d2e842106.png" },
    { id: generateUniqueId(), name: "Mozzarella", price: 1.3, image: "https://cdn.dodostatic.net/static/Img/Ingredients/cdea869ef287426386ed634e6099a5ba.png" },
    { id: generateUniqueId(), name: "Cheddar and Parmesan cheeses", price: 1.6, image: "https://cdn.dodostatic.net/static/Img/Ingredients/000D3A22FA54A81411E9AFA69C1FE796" },
    { id: generateUniqueId(), name: "Hot Jalapeno Pepper", price: 1.2, image: "https://cdn.dodostatic.net/static/Img/Ingredients/11ee95b6bfdf98fb88a113db92d7b3df.png" },
    { id: generateUniqueId(), name: "Tender Chicken", price: 2.0, image: "https://cdn.dodostatic.net/static/Img/Ingredients/000D3A39D824A82E11E9AFA5B328D35A" },
    { id: generateUniqueId(), name: "Champignons", price: 1.1, image: "https://cdn.dodostatic.net/static/Img/Ingredients/000D3A22FA54A81411E9AFA67259A324" },
    { id: generateUniqueId(), name: "Bacon", price: 1.9, image: "https://cdn.dodostatic.net/static/Img/Ingredients/000D3A39D824A82E11E9AFA637AAB68F" },
    { id: generateUniqueId(), name: "Fresh tomatoes", price: 1.0, image: "https://cdn.dodostatic.net/static/Img/Ingredients/000D3A39D824A82E11E9AFA7AC1A1D67" },
    { id: generateUniqueId(), name: "Sweet pepper", price: 1.2, image: "https://cdn.dodostatic.net/static/Img/Ingredients/000D3A22FA54A81411E9AFA63F774C1B" }
  ];
  await db.insert(additionalIngredient).values(additionalData);

  const attributeNames = ["25 sm", "30 sm", "35 sm", "Traditional", "Subtle"];
  const attributesData = attributeNames.map(name => ({
    id: generateUniqueId(),
    type: name.includes("sm") ? "size" : "dough",
    name
  }));
  await db.insert(attribute).values(attributesData);

  const getAttrId = (name: string) => attributesData.find(a => a.name === name)?.id!;

  const pizzaNames = [
    "Margherita",
    "Pepperoni",
    "Hawaiian",
    "Veggie Delight",
    "BBQ Chicken",
    "Four Cheese",
    "Spicy Inferno",
    "Mushroom Lovers",
    "Double Chicken",
    "Dodo",
    "BBQ Pepperoni",
    "Chicken Ranch",
    "Meaty",
    "Hot Pepperoni",
    "Cheesy",
  ];

  const pizzaTypes: Record<string, string> = {
    "Margherita": "Vegetarian",
    "Pepperoni": "Meaty",
    "Hawaiian": "Sweet",
    "Veggie Delight": "Vegetarian",
    "BBQ Chicken": "With Chicken",
    "Four Cheese": "Vegetarian",
    "Spicy Inferno": "Spicy",
    "Mushroom Lovers": "Vegetarian",
    "Double Chicken": "With Chicken",
    "Dodo": "With Chicken",
    "BBQ Pepperoni": "Meaty",
    "Chicken Ranch": "With Chicken",
    "Meaty": "Meaty",
    "Hot Pepperoni": "Spicy",
    "Cheesy": "Sweet",
  };

  const pepperoniVariations = [
    { size: "25 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d612f98bc0ea828957caff9c8ec.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d612ff49f2c98064fb647c3aa86.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d612fc7b7fca5be822752bee1e5.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6130241e75b0ab33725248c0d0.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61304faf5a98a6958f2bb2d260.avif" }
  ];

  const infernoVariations = [
    { size: "25 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61703f8b47b1e4933820a7d91f.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61706d472f9a5d71eb94149304.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61709f9f34a0b85f25ecdb286d.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6170d5f99c89e91a2b3b91d16e.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6171059e7d8d5af72d04721d66.avif" }
  ];

  const fourCheeseVariations = [
    { size: "25 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6129efa5199e5804122865390f.avif" },
    { size: "25 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6129efa5199e5804122865390f.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d612a1c13cbbfcc286c332d7762.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d612a4f55c98de733cd1818c613.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d612a81468c99a6038db62dd54a.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d612aaf9ce0b0ed874462faf808.avif" }
  ];

  const hawaiianVariations = [
    { size: "25 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d617e6556a6bb1c37aa8de36ae5.avif" },
    { size: "25 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d617e6556a6bb1c37aa8de36ae5.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d617e9339cfb185921a343ad8fd.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d617ec5b908a4ada0c2dac97a4d.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d617ef504b8b95c614b0eeaaafb.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d617f240ef79b3ed9d1ec47b81d.avif" }
  ];

  const veggieDelightVariations = [
    { size: "25 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6105bbfc3aa9734180aba7f61b.avif" },
    { size: "25 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6105bbfc3aa9734180aba7f61b.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6105ef6690b86fbde6150b5b0c.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61061cdd79b1272df775ba4772.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d610649f9a898c96ee96fea37a5.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61067e771497808be0b32c6c99.avif" }
  ];

  const mushroomLoversVariations = [
    { size: "25 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61543cb077931c15b0e271347f.avif" },
    { size: "25 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61543cb077931c15b0e271347f.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61546d8483a61a0bbaa7adcc78.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6154983942b98a2318a1455f88.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6154c786f2940500127aa6d33e.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6154ed7cedada4f410c8947498.avif" }
  ];

  const bbqChickenVariations = [
    { size: "25 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d610fd1960296609bc2946d660e.avif" },
    { size: "25 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d610fd1960296609bc2946d660e.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61103e8ecfa6c52919e4f61b83.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/019589a583bf70f8a70d2c7452feace9.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61106c12ff8350c8d5d40e9309.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61109aac3ca2549394e61e3812.avif" }
  ];

  const chickenRanchVariations = [
    { size: "25 sm", dough: "Traditional", image:"https://media.dodostatic.net/image/r:1875x1875/11ef4fedd776d28ea93b6bf621e5efbc.avif" },
    { size: "25 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ef4fedd776d28ea93b6bf621e5efbc.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ef4feddf588b4ea7493ba40fdf934c.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ef4fede4be274e812a9dbe3a13ae1d.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ef4fedeada20d0b5dff20d0014d93d.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ef4fedf286fd09b2d9f493cb4abc30.avif" }
  ];

  const meatyVariations = [
    { size: "25 sm", dough: "Traditional", image:"https://media.dodostatic.net/image/r:1875x1875/11ee7d6108b7b5ddada9508b8ae5a913.avif" },
    { size: "25 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6108b7b5ddada9508b8ae5a913.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6108e3a1c9952cd3a7f39a4d02.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d610925d43a9543f2c40f03ae5f.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61095e56e6bbc9d410f89df983.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61098938f2bdceeff8ca3fc1c9.avif" }
  ];

  const hotPepperoniVariations = [
    { size: "25 sm", dough: "Traditional", image:"https://media.dodostatic.net/image/r:1875x1875/11ef8537ce655440a24df6a7b892357a.avif" },
    { size: "25 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ef8537ce655440a24df6a7b892357a.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ef8537f2244e8caeb7c69e644d0537.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ef8537eeb8f2be97bfee13cf3fee2c.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ef8537f549e80786d136360c7aa7ed.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ef8537f6cac0e1a0796cedf536cbd2.avif" }
  ];

  const cheesyVariations = [
    { size: "25 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d610cf7e265b7c72be5ae757ca7.avif" },
    { size: "25 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d610cf7e265b7c72be5ae757ca7.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d610d2925109ab2e1c92cc5383c.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d610d5dbb14a551b640b90776fc.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d610d91679bb519f38c3f45880f.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d610dbefef68ade96df563888b4.avif" }
  ];

  const margheritaVariations = [
    { size: "25 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6105bbfc3aa9734180aba7f61b.avif" },
    { size: "25 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6105bbfc3aa9734180aba7f61b.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6105ef6690b86fbde6150b5b0c.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61061cdd79b1272df775ba4772.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d610649f9a898c96ee96fea37a5.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61067e771497808be0b32c6c99.avif" }
  ];

  const dodoVariations = [
    { size: "25 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/019591a7f28371688edeb8182e521b3b.avif" },
    { size: "25 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/019591a7f28371688edeb8182e521b3b.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/019591a8006370038e0a9fb3e94925d1.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/019591a80924707f8d472bdcd622dd30.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/019591a81257786ebe90159effdfcf7b.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/019591a81a4b768a908acb98d51c85fe.avif" }
  ];

  const doubleChickenVariations = [
    { size: "25 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d614c92fba9a7c5f124c809fe88.avif" },
    { size: "25 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d614c92fba9a7c5f124c809fe88.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d614cbe0530b7234b6d7a6e5f8e.avif" },
    { size: "30 sm", dough: "Subtle", image: " https://media.dodostatic.net/image/r:1875x1875/11ee7d614ce7d88391642fe26ecb2245.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d614d1bb6cb8ded93790d79e466.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d614d572a8e844206649c75c132.avif" }
  ];

  const bbqPepperoniVariations = [
    { size: "25 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6150a9426cb905492c1cc3f43d.avif" },
    { size: "25 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6150a9426cb905492c1cc3f43d.avif" },
    { size: "30 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d6150d498419e133df19945a00d.avif" },
    { size: "30 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61510131c1ae0c8bd2191f70db.avif" },
    { size: "35 sm", dough: "Traditional", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61512fa081a7a1f20647232e15.avif" },
    { size: "35 sm", dough: "Subtle", image: "https://media.dodostatic.net/image/r:1875x1875/11ee7d61515a13f1aca2c5ee2a8d51de.avif" }
  ];

  const variationMap = new Map<string, any>([
    ["Pepperoni", pepperoniVariations],
    ["Spicy Inferno", infernoVariations],
    ["Margherita", margheritaVariations],
    ["Four Cheese", fourCheeseVariations],
    ["Hawaiian", hawaiianVariations],
    ["Veggie Delight", veggieDelightVariations],
    ["Mushroom Lovers", mushroomLoversVariations],
    ["BBQ Chicken", bbqChickenVariations],
    ["Double Chicken", doubleChickenVariations],
    ["Dodo", dodoVariations],
    ["BBQ Pepperoni", bbqPepperoniVariations],
    ["Chicken Ranch", chickenRanchVariations],
    ["Meaty", meatyVariations],
    ["Hot Pepperoni", hotPepperoniVariations],
    ["Cheesy", cheesyVariations],
  ]);

  function getVariationsByName(name: string) {
    return variationMap.get(name) || [];
  }
  
  for (let i = 0; i < pizzaNames.length; i++) {
    const pizzaId = generateUniqueId();
    const name = pizzaNames[i];
    const type = pizzaTypes[name];

    await db.insert(pizza).values({
      id: pizzaId,
      name,
      type,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const variations = getVariationsByName(name);

    if (variations.length > 0) {
      for (const { size, dough, image } of variations) {
        const variationId = generateUniqueId();

        await db.insert(pizzaVariation).values({
          id: variationId,
          image,
          totalPrice: 10 + Math.random() * 5,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await db.insert(pizzaToVariations).values({
          pizzaId,
          pizzaVariationId: variationId
        });

        await db.insert(pizzaVariationToAttribute).values([
          { pizzaVariationId: variationId, attributeId: getAttrId(size) },
          { pizzaVariationId: variationId, attributeId: getAttrId(dough) }
        ]);

        const randIngredients = ingredientsData.sort(() => 0.5 - Math.random()).slice(0, 2);
        await db.insert(pizzaVariationToIngredients).values(
          randIngredients.map(ing => ({ pizzaVariationId: variationId, ingredientId: ing.id }))
        );

        const randAdditionals = additionalData.sort(() => 0.5 - Math.random()).slice(0, 5);
        await db.insert(pizzaVariationToAdditional).values(
          randAdditionals.map(add => ({ pizzaVariationId: variationId, additionalIngredientId: add.id }))
        );
      }
    } else {
      for (let j = 0; j < 2; j++) {
        const variationId = generateUniqueId();
        await db.insert(pizzaVariation).values({
          id: variationId,
          image: "https://media.dodostatic.net/image/r:584x584/11ee7d612a1c13cbbfcc286c332d7762.avif",
          totalPrice: 9.99 + j * 2,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await db.insert(pizzaToVariations).values({
          pizzaId,
          pizzaVariationId: variationId
        });

        const randAttributes = attributesData.sort(() => 0.5 - Math.random()).slice(0, 2);
        await db.insert(pizzaVariationToAttribute).values(
          randAttributes.map(attr => ({ pizzaVariationId: variationId, attributeId: attr.id }))
        );

        const randIngredients = ingredientsData.sort(() => 0.5 - Math.random()).slice(0, 2);
        await db.insert(pizzaVariationToIngredients).values(
          randIngredients.map(ing => ({ pizzaVariationId: variationId, ingredientId: ing.id }))
        );

        const randAdditionals = additionalData.sort(() => 0.5 - Math.random()).slice(0, 5);
        await db.insert(pizzaVariationToAdditional).values(
          randAdditionals.map(add => ({ pizzaVariationId: variationId, additionalIngredientId: add.id }))
        );
      }
    }

    const baseIngredients = ingredientsData.sort(() => 0.5 - Math.random()).slice(0, 3);
    await db.insert(pizzaToIngredients).values(
      baseIngredients.map(ing => ({
        pizzaId,
        ingredientId: ing.id
      }))
    );
  }
}

seed().catch((err) => {
  console.error("❌ Seeding error:", err);
});

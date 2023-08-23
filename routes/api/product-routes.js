const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

//GET all products with associated Category and Tag data
router.get('/', async (req, res) => {
    try {
        const productData = await Product.findAll({
            include: [{ model: Category }, { model: Tag }]
        });
        res.status(200).json(productData);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET a single product by its `id` with associated Category and Tag data
router.get('/:id', async (req, res) => {
    try {
        const productData = await Product.findByPk(req.params.id, {
            include: [{ model: Category }, { model: Tag }]
        });

        if (!productData) {
            res.status(404).json({ message: 'No product found with that id!' });
            return;
        }

        res.status(200).json(productData);
    } catch (err) {
        res.status(500).json(err);
    }
});

//POST to create a new product
router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        
        //if there's product tags, we need to create pairings to bulk create in the ProductTag model
        if (req.body.tagIds && req.body.tagIds.length) {
            const productTagIdArr = req.body.tagIds.map((tag_id) => {
                return {
                    product_id: product.id,
                    tag_id,
                };
            });
            await ProductTag.bulkCreate(productTagIdArr);
        }
        
        res.status(200).json(product);
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

//PUT to update a product
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.update(req.body, {
            where: {
                id: req.params.id,
            },
        });

        if (!product) {
            res.status(404).json({ message: 'No product with this id!' });
            return;
        }

        //Handle tag associations here if tagIds are provided
        if (req.body.tagIds) {
            const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });
            const productTagIds = productTags.map(({ tag_id }) => tag_id);
            
            const newProductTags = req.body.tagIds
                .filter(tag_id => !productTagIds.includes(tag_id))
                .map(tag_id => ({ product_id: req.params.id, tag_id }));
            
            const productTagsToRemove = productTags
                .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
                .map(({ id }) => id);

            await ProductTag.destroy({ where: { id: productTagsToRemove } });
            await ProductTag.bulkCreate(newProductTags);
        }

        res.status(200).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

//DELETE a product by its `id` value
router.delete('/:id', async (req, res) => {
    try {
        const productData = await Product.destroy({
            where: {
                id: req.params.id,
            },
        });

        if (!productData) {
            res.status(404).json({ message: 'No product with this id!' });
            return;
        }

        res.status(200).json(productData);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
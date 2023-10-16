export default {
    type: "object",
    properties: {
        title: { type: 'string' },
        price: { type: 'number'},
        description: { type: 'string'},
        count: { type: 'number'}
    },
    required: ['title']
} as const;

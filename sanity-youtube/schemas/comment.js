export default {
  name: 'comment',
  type: 'document',
  title: 'Comment',
  fields: [
    {
      name: 'name',
      type: 'string',
    },
    {
      name: 'approved',
      type: 'boolean',
      title: 'Approved',
      description: 'Whether the comment has been approved by the moderator',
    },
    {
      name: 'email',
      type: 'string',
      title: 'Email',
      description: 'The email of the comment author',
    },
    {
      name: 'comment',
      type: 'text',
      title: 'Comment',
      description: 'The comment itself',
    },
    {
      name: 'post',
      type: 'reference',
      to: [{ type: 'post' }],
    },
  ],
}

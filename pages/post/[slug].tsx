import { sanityClient, urlFor } from '../../sanity'
import Header from '../../components/Header'
import { Post, Comment } from '../../typings'
import { GetStaticProps } from 'next'
import PortableText from 'react-portable-text'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useState } from 'react'

interface Props {
  post: Post
}

interface IFormInput {
  _id: string
  name: string
  email: string
  comment: string
}

function Post( { post }: Props ) {
  
  const [submitted, setSubmitted] = useState(false)

  // Form attributes
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>()

  // Form submit handler
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    console.log(data)
    await fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(() => {
        console.log( data )
        setSubmitted(true)
      })
      .catch((err) => {
        console.log( err )
        setSubmitted(false)
      })
  }

  return (
    <main>
      <Header />

      <img
        src={urlFor(post.mainImage).url()}
        alt=""
        className="h-40 w-full object-cover"
      />
      <article className="mx-auto max-w-3xl p-5">
        <h1 className="mt-10 mb-3 text-3xl">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500">{post.description}</h2>

        <div>
          <img
            className="h-10 w-10 rounded-full"
            src={urlFor(post.author.image).url()!}
            alt=""
          />
          <p>
            Blog post by{' '}
            <span className="text-green-600">{post.author.name}</span>
            {' - '}Published at {new Date(post._createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-10">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="{ ...props } my-5 text-2xl font-bold" />
              ),
              h2: (props: any) => (
                <h1 className="{ ...props } my-5 text-xl font-bold" />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>
      <hr className="my-5 mx-auto max-w-lg border border-yellow-500" />

      {
        submitted ? (
          <div className='flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto'>
            <h3 className='text-3xl font-bold'>Thank you for submitting your comment!</h3>
            <p>Once it has been approved, it will appear below!</p>
          </div>
        ): (
          <form
        className="mx-auto mb-10 flex max-w-2xl flex-col p-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h3 className="text-sm text-yellow-500"> Enjoiyed this article?</h3>
        <h4 className="text-3xl font-bold">Leave a commnt below!</h4>
        <hr className="mt-2 py-3" />

        <input {...register('_id')} name="_id" value={post._id} type="hidden" />

        <label htmlFor="" className="mb-5 block">
          <span className="pl-2 text-gray-700">Name</span>
          <input
            {...register('name', { required: true })}
            type="text"
            className="form-input mt-1 block w-full rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring "
            placeholder='Your name: Ex: "John Due"'
          />
        </label>
        <label htmlFor="" className="mb-5 block">
          <span className="pl-2 text-gray-700">Email</span>
          <input
            {...register('email', { required: true })}
            type="email"
            className="form-input mt-1 block w-full rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring "
            placeholder="youremail@server.com"
          />
        </label>
        <label htmlFor="" className="mb-5 block">
          <span className="pl-2 text-gray-700">Comment</span>
          <textarea
            {...register('comment', { required: true })}
            rows={8}
            className="form-input mt-1 block w-full rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring "
            placeholder="Type your comment here..."
          />
        </label>

        {/* erros */}
        <div className="flex flex-col p-5">
          {errors.name && (
            <p className="text-red-500"> - The Name Field is required</p>
          )}
          {errors.email && (
            <p className="text-red-500"> - The Email Field is required</p>
          )}
          {errors.comment && (
            <p className="text-red-500"> - The Comment Field is required</p>
          )}
        </div>

        <input
          type="submit"
          className="shaddow focus:shadow-outline ease cursor-pointer rounded bg-yellow-500 py-2 px-4 font-bold text-white transition-all hover:bg-yellow-400 focus:outline-none"
          value={'Submit'}
        />
      </form>
        )
      }
      {/* Comments */ }
      <div className='flex flex-col p-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2'>
        <h3 className='text-4xl'>
          Comments
        </h3>
        <hr className='pb-2' />
        
        {
          post.comments.map( ( comment) => (
            <div key={ comment._id }>
              <p>
                <span className='text-yellow-500'>
                  { comment.name }{': '}
                </span>
                  {comment.comment}
              </p>

          </div>
            ) )
        }
      </div>
      
    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `*[_type == "post"] {
  _id,
  slug {
      current
  }
}`

  const posts = await sanityClient.fetch(query)

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  console.log(params?.slug)
  const query = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  _createdAt,
  title,
  author -> {
    name,
    image
  },
  "comments": *[
    _type == "comment" &&
    post._ref == ^._id && 
    approved == true
  ],
  description,
  mainImage,
  slug,
  body
}`

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  })

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60,
  }
}

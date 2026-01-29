import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core'
import { Tweet as ReactTweet } from 'react-tweet'
import { useMemo } from 'react'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        tweet: {
            setTweet: (options: { src: string }) => ReturnType
        }
    }
}

const TWEET_REGEX = /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/
const X_REGEX = /^https?:\/\/x\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/

const TweetComponent = ({ node }: any) => {
    const url = node.attrs.src
    // Derive tweetId from url using useMemo - pure derivation, no need for effect
    const tweetId = useMemo(() => {
        if (!url) return null
        const match = url.match(TWEET_REGEX) || url.match(X_REGEX)
        return match ? match[3] : null
    }, [url])

    if (!tweetId) {
        return (
            <NodeViewWrapper className="p-4 border border-red-200 bg-red-50 text-red-500 rounded">
                Invalid Tweet URL
            </NodeViewWrapper>
        )
    }

    return (
        <NodeViewWrapper className="my-8 flex justify-center">
            <div className="w-full max-w-[550px]" data-twitter="true">
                <ReactTweet id={tweetId} />
            </div>
        </NodeViewWrapper>
    )
}

export const Tweet = Node.create({
    name: 'tweet',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-twitter]',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-twitter': 'true' })]
    },

    addNodeView() {
        return ReactNodeViewRenderer(TweetComponent)
    },

    addCommands() {
        return {
            setTweet:
                (options: { src: string }) =>
                    ({ commands }: any) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: options,
                        })
                    },
        }
    },

    addInputRules() {
        return [
            nodeInputRule({
                find: TWEET_REGEX,
                type: this.type,
                getAttributes: (match) => {
                    return { src: match[0] }
                }
            }),
            nodeInputRule({
                find: X_REGEX,
                type: this.type,
                getAttributes: (match) => {
                    return { src: match[0] }
                }
            })
        ]
    }
})

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Article } from "@/types";
import { notFound } from "next/navigation";
import ArticleView from "./ArticleView";

export const dynamic = 'force-dynamic';

async function getArticle(slug: string): Promise<Article | null> {
    // Articles are stored with slug as the document ID
    const docRef = doc(db, "articles", slug);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    const data = docSnap.data();
    return {
        id: docSnap.id,
        title: data.title,
        slug: data.slug,
        coverImageUrl: data.coverImageUrl,
        content: data.content,
        author: data.author,
        hideTitleOverlay: data.hideTitleOverlay,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    } as Article;
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
    const article = await getArticle(params.slug);

    if (!article) {
        notFound();
    }

    return <ArticleView article={article} />;
}

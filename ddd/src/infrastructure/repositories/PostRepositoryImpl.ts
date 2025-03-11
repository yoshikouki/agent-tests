import { dbAll, dbGet, dbRun } from "@/lib/db";
import type { PostRepository } from "@/domain/content/repositories/PostRepository";
import { Post, type PostProps } from "@/domain/content/entities/Post";

// Type for database row
interface PostRow {
	id: string;
	author_id: string;
	content: string;
	attachments: string | null;
	created_at: string;
	updated_at: string;
}

export class PostRepositoryImpl implements PostRepository {
	async save(post: Post): Promise<void> {
		const dto = post.toDTO();
		const existingPost = await this.findById(dto.id);

		if (existingPost) {
			// Update existing post
			await dbRun(
				`UPDATE posts SET 
          content = $content, 
          attachments = $attachments, 
          updated_at = $updatedAt 
        WHERE id = $id`,
				{
					$id: dto.id,
					$content: dto.content,
					$attachments: dto.attachments,
					$updatedAt: dto.updatedAt.toISOString(),
				},
			);
		} else {
			// Insert new post
			await dbRun(
				`INSERT INTO posts (
          id, 
          author_id, 
          content, 
          attachments, 
          created_at, 
          updated_at
        ) VALUES (
          $id, 
          $authorId, 
          $content, 
          $attachments, 
          $createdAt, 
          $updatedAt
        )`,
				{
					$id: dto.id,
					$authorId: dto.authorId,
					$content: dto.content,
					$attachments: dto.attachments,
					$createdAt: dto.createdAt.toISOString(),
					$updatedAt: dto.updatedAt.toISOString(),
				},
			);
		}
	}

	async findById(id: string): Promise<Post | null> {
		const row = await dbGet<PostRow>("SELECT * FROM posts WHERE id = $id", {
			$id: id,
		});

		if (!row) return null;

		return Post.reconstitute(this.mapRowToProps(row));
	}

	async findByAuthorId(
		authorId: string,
		page = 1,
		limit = 10,
	): Promise<{ posts: Post[]; total: number }> {
		const offset = (page - 1) * limit;

		const rows = await dbAll<PostRow>(
			`SELECT * FROM posts 
       WHERE author_id = $authorId
       ORDER BY created_at DESC
       LIMIT $limit OFFSET $offset`,
			{
				$authorId: authorId,
				$limit: limit,
				$offset: offset,
			},
		);

		const countResult = await dbGet<{ count: number }>(
			"SELECT COUNT(*) as count FROM posts WHERE author_id = $authorId",
			{ $authorId: authorId },
		);

		const total = countResult?.count || 0;
		const posts = rows.map((row) => Post.reconstitute(this.mapRowToProps(row)));

		return { posts, total };
	}

	async findAll(
		page = 1,
		limit = 10,
	): Promise<{ posts: Post[]; total: number }> {
		const offset = (page - 1) * limit;

		const rows = await dbAll<PostRow>(
			`SELECT * FROM posts 
       ORDER BY created_at DESC
       LIMIT $limit OFFSET $offset`,
			{
				$limit: limit,
				$offset: offset,
			},
		);

		const countResult = await dbGet<{ count: number }>(
			"SELECT COUNT(*) as count FROM posts",
			{},
		);

		const total = countResult?.count || 0;
		const posts = rows.map((row) => Post.reconstitute(this.mapRowToProps(row)));

		return { posts, total };
	}

	async findByUserFeed(
		userId: string,
		page = 1,
		limit = 10,
	): Promise<{ posts: Post[]; total: number }> {
		const offset = (page - 1) * limit;

		const rows = await dbAll<PostRow>(
			`SELECT p.* FROM posts p
       JOIN follows f ON p.author_id = f.followee_id
       WHERE f.follower_id = $userId
       ORDER BY p.created_at DESC
       LIMIT $limit OFFSET $offset`,
			{
				$userId: userId,
				$limit: limit,
				$offset: offset,
			},
		);

		const countResult = await dbGet<{ count: number }>(
			`SELECT COUNT(*) as count FROM posts p
       JOIN follows f ON p.author_id = f.followee_id
       WHERE f.follower_id = $userId`,
			{ $userId: userId },
		);

		const total = countResult?.count || 0;
		const posts = rows.map((row) => Post.reconstitute(this.mapRowToProps(row)));

		return { posts, total };
	}

	async delete(id: string): Promise<void> {
		await dbRun("DELETE FROM posts WHERE id = $id", { $id: id });
	}

	// Helper method to map database row to PostProps
	private mapRowToProps(row: PostRow): PostProps {
		return {
			id: row.id,
			authorId: row.author_id,
			content: row.content,
			attachments: row.attachments,
			createdAt: new Date(row.created_at),
			updatedAt: new Date(row.updated_at),
		};
	}
}

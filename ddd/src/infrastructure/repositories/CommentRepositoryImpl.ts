import { dbAll, dbGet, dbRun } from "@/lib/db";
import type { CommentRepository } from "@/domain/content/repositories/CommentRepository";
import { Comment, type CommentProps } from "@/domain/content/entities/Comment";

// Type for database row
interface CommentRow {
	id: string;
	post_id: string;
	author_id: string;
	content: string;
	created_at: string;
	updated_at: string;
}

export class CommentRepositoryImpl implements CommentRepository {
	async save(comment: Comment): Promise<void> {
		const dto = comment.toDTO();
		const existingComment = await this.findById(dto.id);

		if (existingComment) {
			// Update existing comment
			await dbRun(
				`UPDATE comments SET 
          content = $content, 
          updated_at = $updatedAt 
        WHERE id = $id`,
				{
					$id: dto.id,
					$content: dto.content,
					$updatedAt: dto.updatedAt.toISOString(),
				},
			);
		} else {
			// Insert new comment
			await dbRun(
				`INSERT INTO comments (
          id, 
          post_id, 
          author_id, 
          content, 
          created_at, 
          updated_at
        ) VALUES (
          $id, 
          $postId, 
          $authorId, 
          $content, 
          $createdAt, 
          $updatedAt
        )`,
				{
					$id: dto.id,
					$postId: dto.postId,
					$authorId: dto.authorId,
					$content: dto.content,
					$createdAt: dto.createdAt.toISOString(),
					$updatedAt: dto.updatedAt.toISOString(),
				},
			);
		}
	}

	async findById(id: string): Promise<Comment | null> {
		const row = await dbGet<CommentRow>(
			"SELECT * FROM comments WHERE id = $id",
			{ $id: id },
		);

		if (!row) return null;

		return Comment.reconstitute(this.mapRowToProps(row));
	}

	async findByPostId(
		postId: string,
		page = 1,
		limit = 10,
	): Promise<{ comments: Comment[]; total: number }> {
		const offset = (page - 1) * limit;

		const rows = await dbAll<CommentRow>(
			`SELECT * FROM comments 
       WHERE post_id = $postId
       ORDER BY created_at ASC
       LIMIT $limit OFFSET $offset`,
			{
				$postId: postId,
				$limit: limit,
				$offset: offset,
			},
		);

		const countResult = await dbGet<{ count: number }>(
			"SELECT COUNT(*) as count FROM comments WHERE post_id = $postId",
			{ $postId: postId },
		);

		const total = countResult?.count || 0;
		const comments = rows.map((row) =>
			Comment.reconstitute(this.mapRowToProps(row)),
		);

		return { comments, total };
	}

	async findByAuthorId(
		authorId: string,
		page = 1,
		limit = 10,
	): Promise<{ comments: Comment[]; total: number }> {
		const offset = (page - 1) * limit;

		const rows = await dbAll<CommentRow>(
			`SELECT * FROM comments 
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
			"SELECT COUNT(*) as count FROM comments WHERE author_id = $authorId",
			{ $authorId: authorId },
		);

		const total = countResult?.count || 0;
		const comments = rows.map((row) =>
			Comment.reconstitute(this.mapRowToProps(row)),
		);

		return { comments, total };
	}

	async delete(id: string): Promise<void> {
		await dbRun("DELETE FROM comments WHERE id = $id", { $id: id });
	}

	// Helper method to map database row to CommentProps
	private mapRowToProps(row: CommentRow): CommentProps {
		return {
			id: row.id,
			postId: row.post_id,
			authorId: row.author_id,
			content: row.content,
			createdAt: new Date(row.created_at),
			updatedAt: new Date(row.updated_at),
		};
	}
}

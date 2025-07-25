import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { FixedEntity } from '../../../utils/fixed.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { CommentEntity } from '../../comment/entities/comment.entity';
import { MediaEntity } from '../../../utils/media.entity';

export enum PostStatus {
	'DRAFT' = 'Draft',
	'PUBLISHED' = 'Published',
}

@Entity()
export class PostEntity extends FixedEntity {
	@Column('simple-array')
	tags: string[];

	@Column()
	title: string;

	@Column({
		unique: true,
	})
	slug: string;

	@Column('text')
	content: string;

	@Column()
	publishedAt: Date;

	@Column()
	status: PostStatus;

	@ManyToOne(() => UserEntity, (user) => user.posts)
	author: UserEntity;

	@OneToMany(() => CommentEntity, (comment) => comment.post)
	comments: CommentEntity[];

	@OneToOne(() => MediaEntity, (media) => media.post)
	media: MediaEntity;
}

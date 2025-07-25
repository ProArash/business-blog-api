import { Column, Entity, ManyToOne } from 'typeorm';
import { FixedEntity } from '../../../utils/fixed.entity';
import { PostEntity } from '../../post/entities/post.entity';

export enum CommentStatus {
	'CONFIRMED' = 'Confirmed',
	'PENDING' = 'Pending',
	'REJECTED' = 'Rejected',
}

@Entity()
export class CommentEntity extends FixedEntity {
	@Column('text')
	content: string;

	@Column()
	name: string;

	@Column()
	email: string;

	@Column()
	status: CommentStatus;

	@ManyToOne(() => PostEntity, (post) => post.comments)
	post: PostEntity;
}

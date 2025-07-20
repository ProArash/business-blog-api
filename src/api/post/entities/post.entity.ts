import { Column, Entity, ManyToOne } from 'typeorm';
import { FixedEntity } from '../../../utils/fixed.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity()
export class PostEntity extends FixedEntity {
	@Column()
	tag: string;

	@Column()
	title: string;

	@Column()
	description: string;

	@Column({ nullable: true })
	imageUrl: string;

	@ManyToOne(() => UserEntity, (user) => user.posts)
	owner: UserEntity;
}

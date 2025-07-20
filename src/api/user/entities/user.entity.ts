import { Column, Entity, OneToMany } from 'typeorm';
import { FixedEntity } from '../../../utils/fixed.entity';
import { UserRoles } from '../user.roles';
import { PostEntity } from '../../post/entities/post.entity';

@Entity()
export class UserEntity extends FixedEntity {
	@Column({
		nullable: true,
	})
	name: string;

	@Column()
	username: string;

	@Column({
		select: false,
	})
	password: string;

	@Column('simple-array')
	roles: UserRoles[];

	@Column({
		nullable: true,
	})
	avatarUrl: string;

	@OneToMany(() => PostEntity, (post) => post.owner)
	posts: PostEntity[];
}

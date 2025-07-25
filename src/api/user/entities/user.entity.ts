import { Column, Entity, OneToMany } from 'typeorm';
import { FixedEntity } from '../../../utils/fixed.entity';
import { UserRoles } from '../user.roles';
import { PostEntity } from '../../post/entities/post.entity';
import { MediaEntity } from '../../../utils/media.entity';

@Entity()
export class UserEntity extends FixedEntity {
	@Column({
		nullable: true,
	})
	name: string;

	@Column()
	email: string;

	@Column({
		select: false,
	})
	password: string;

	@Column('simple-array')
	roles: UserRoles[];

	@OneToMany(() => PostEntity, (post) => post.author)
	posts: PostEntity[];

	@OneToMany(() => MediaEntity, (file) => file.user)
	files: PostEntity[];
}

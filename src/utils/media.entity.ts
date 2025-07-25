import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { FixedEntity } from './fixed.entity';
import { UserEntity } from '../api/user/entities/user.entity';
import { SliderEntity } from '../api/slider/entities/slider.entity';
import { PostEntity } from '../api/post/entities/post.entity';
import { PortfolioEntity } from '../api/portfolio/entities/portfolio.entity';

export enum MediaType {
	'IMAGE' = 'Image',
	'AUDIO' = 'Audio',
	'VIDEO' = 'Video',
	'UNKNOWN' = 'Unknown',
}

@Entity()
export class MediaEntity extends FixedEntity {
	@Column()
	mediaType: MediaType;

	@Column()
	mediaUrl: string;

	@ManyToOne(() => UserEntity, (user) => user.files)
	user: UserEntity;

	@ManyToOne(() => SliderEntity, (slider) => slider.medias)
	slider: SliderEntity;

	@OneToOne(() => PostEntity, (post) => post.media)
	@JoinColumn()
	post: PostEntity;

	@OneToOne(() => PortfolioEntity, (portfolio) => portfolio.media)
	@JoinColumn()
	portfolio: PortfolioEntity;
}

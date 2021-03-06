import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

//* Internal import
import { UserRole } from '../../../auth/entities/userRole.enum';

@Entity()
export class User {
        @ObjectIdColumn()
        _id: ObjectId;

        @Column()
        fullName: string;

        @Column()
        username: string;

        @Column()
        password: string;

        @Column()
        email: string;

        @Column()
        avatarUrl: string;

        @Column()
        googleId: string;

        @Column()
        facebookId: string;

        @Column()
        githubId: string;

        @Column()
        isPremium: boolean;

        @Column()
        role: UserRole;

        @Column()
        quizIds: Array<ObjectId>;

        constructor(username?: string, password?: string, fullName?: string) {
                this.username = username;
                this.password = password;
                this.fullName = fullName;
                this.email = '';
                this.avatarUrl = '';
                this.googleId = '';
                this.facebookId = '';
                this.githubId = '';
                this.isPremium = false;
                this.role = UserRole.USER;
                this.quizIds = [];
        }
}

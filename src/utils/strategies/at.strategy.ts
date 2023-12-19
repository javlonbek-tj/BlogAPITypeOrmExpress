import { ExtractJwt } from 'passport-jwt';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { AppDataSource } from '../../data-source';
import { User } from '../../entities/user.entity';
import * as tokenService from '../../services/token.service';
import { changedPasswordAfter } from '../../services/auth.service';

const userRepo = AppDataSource.getRepository(User);

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret',
};

const ATStrategy = new JwtStrategy(
  options,
  async (payload: tokenService.JwtPayload, done) => {
    try {
      const user = await userRepo.findOneBy({ id: payload.sub }); 
      if(user) {
            console.log(user.id);
      }
  
         
      if (user && !changedPasswordAfter(payload.iat, user.passwordChangedAt)) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  }
);

export default ATStrategy;

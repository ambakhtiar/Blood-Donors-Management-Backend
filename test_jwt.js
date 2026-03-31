import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

console.log('Secret:', secret?.substring(0, 5) + '...');
console.log('Expires In:', expiresIn);

const token = jwt.sign({ userId: 'test', role: 'USER' }, secret as string, { expiresIn: expiresIn as any });
const decoded = jwt.decode(token) as any;

console.log('Current Time (s):', Math.floor(Date.now() / 1000));
console.log('Token iat:', decoded.iat);
console.log('Token exp:', decoded.exp);
console.log('Diff (exp - iat):', decoded.exp - decoded.iat);
console.log('Remaining (exp - now):', decoded.exp - Math.floor(Date.now() / 1000));

if (decoded.exp < Math.floor(Date.now() / 1000)) {
    console.error('ERROR: Token is generated ALREADY EXPIRED!');
} else {
    console.log('SUCCESS: Token is valid.');
}

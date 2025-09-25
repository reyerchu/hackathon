const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: 'wp_defintek_io'
});

const wpAuth = {
    // Verify WordPress user credentials
    async verifyCredentials(username, password) {
        try {
            const [rows] = await pool.execute(
                'SELECT ID, user_login, user_pass, user_email, display_name FROM wp_users WHERE user_login = ? OR user_email = ?',
                [username, username]
            );

            if (rows.length === 0) {
                return null;
            }

            const user = rows[0];
            
            // WordPress uses PHPass for password hashing
            // We need to verify the password using the same algorithm
            const isValid = await this.verifyWPPassword(password, user.user_pass);
            
            if (!isValid) {
                return null;
            }

            // Get user roles from wp_usermeta
            const [roles] = await pool.execute(
                'SELECT meta_value FROM wp_usermeta WHERE user_id = ? AND meta_key = ?',
                [user.ID, 'wp_capabilities']
            );

            const userRoles = roles.length > 0 ? Object.keys(JSON.parse(roles[0].meta_value)) : ['subscriber'];

            return {
                id: user.ID,
                username: user.user_login,
                email: user.user_email,
                displayName: user.display_name,
                roles: userRoles
            };
        } catch (error) {
            console.error('Error verifying WordPress credentials:', error);
            throw error;
        }
    },

    // Verify WordPress password hash (PHPass format)
    async verifyWPPassword(password, hash) {
        // WordPress uses PHPass with 8 iterations and a 22 character salt
        const iterations = 8;
        const salt = hash.substr(4, 8);
        
        // Generate hash using the same method as WordPress
        const generatedHash = await this.generateWPHash(password, salt, iterations);
        
        return hash === generatedHash;
    },

    // Generate WordPress compatible password hash
    async generateWPHash(password, salt, iterations) {
        const hash = await bcrypt.hash(password + salt, iterations);
        return '$P$B' + salt + hash.substr(29);
    },

    // Generate JWT token for authenticated user
    generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                roles: user.roles
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    },

    // Verify JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return null;
        }
    },

    // Get user metadata from WordPress
    async getUserMeta(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT meta_key, meta_value FROM wp_usermeta WHERE user_id = ?',
                [userId]
            );

            const metadata = {};
            rows.forEach(row => {
                metadata[row.meta_key] = row.meta_value;
            });

            return metadata;
        } catch (error) {
            console.error('Error getting user metadata:', error);
            throw error;
        }
    }
};

module.exports = wpAuth;

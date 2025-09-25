const Shared = require('@hackjunction/shared');
const AuthConstants = Shared.Auth;
const wpAuth = require('./wordpress');

const controller = {};

controller.authenticate = async (username, password) => {
    try {
        const user = await wpAuth.verifyCredentials(username, password);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Get user metadata
        const metadata = await wpAuth.getUserMeta(user.id);

        // Map WordPress roles to Junction roles
        const junctionRoles = [];
        if (metadata.wp_capabilities) {
            const wpRoles = JSON.parse(metadata.wp_capabilities);
            if (wpRoles.administrator) {
                junctionRoles.push(AuthConstants.Roles.SUPER_ADMIN);
            }
            if (wpRoles.editor) {
                junctionRoles.push(AuthConstants.Roles.ORGANISER);
            }
            if (wpRoles.author) {
                junctionRoles.push(AuthConstants.Roles.ASSISTANT_ORGANISER);
            }
            if (wpRoles.contributor) {
                junctionRoles.push(AuthConstants.Roles.RECRUITER);
            }
        }

        // Generate JWT token
        const token = wpAuth.generateToken({
            ...user,
            roles: junctionRoles
        });

        return {
            token,
            user: {
                ...user,
                roles: junctionRoles
            }
        };
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
};

controller.verifyToken = async (token) => {
    try {
        const decoded = wpAuth.verifyToken(token);
        if (!decoded) {
            throw new Error('Invalid token');
        }
        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        throw error;
    }
};

controller.grantAssistantOrganiser = async userId => {
    try {
        const metadata = await wpAuth.getUserMeta(userId);
        const capabilities = JSON.parse(metadata.wp_capabilities || '{}');
        capabilities.author = true;
        
        await pool.execute(
            'UPDATE wp_usermeta SET meta_value = ? WHERE user_id = ? AND meta_key = ?',
            [JSON.stringify(capabilities), userId, 'wp_capabilities']
        );
        
        return { success: true };
    } catch (error) {
        console.error('Error granting assistant organiser role:', error);
        throw error;
    }
};

controller.revokeAssistantOrganiser = async userId => {
    try {
        const metadata = await wpAuth.getUserMeta(userId);
        const capabilities = JSON.parse(metadata.wp_capabilities || '{}');
        delete capabilities.author;
        
        await pool.execute(
            'UPDATE wp_usermeta SET meta_value = ? WHERE user_id = ? AND meta_key = ?',
            [JSON.stringify(capabilities), userId, 'wp_capabilities']
        );
        
        return { success: true };
    } catch (error) {
        console.error('Error revoking assistant organiser role:', error);
        throw error;
    }
};

controller.grantRecruiterPermission = async userId => {
    try {
        const metadata = await wpAuth.getUserMeta(userId);
        const capabilities = JSON.parse(metadata.wp_capabilities || '{}');
        capabilities.contributor = true;
        
        await pool.execute(
            'UPDATE wp_usermeta SET meta_value = ? WHERE user_id = ? AND meta_key = ?',
            [JSON.stringify(capabilities), userId, 'wp_capabilities']
        );
        
        return { success: true };
    } catch (error) {
        console.error('Error granting recruiter role:', error);
        throw error;
    }
};

controller.revokeRecruiterPermission = async userId => {
    try {
        const metadata = await wpAuth.getUserMeta(userId);
        const capabilities = JSON.parse(metadata.wp_capabilities || '{}');
        delete capabilities.contributor;
        
        await pool.execute(
            'UPDATE wp_usermeta SET meta_value = ? WHERE user_id = ? AND meta_key = ?',
            [JSON.stringify(capabilities), userId, 'wp_capabilities']
        );
        
        return { success: true };
    } catch (error) {
        console.error('Error revoking recruiter role:', error);
        throw error;
    }
};

controller.updateMetadata = async (userId, updates) => {
    try {
        const entries = Object.entries(updates);
        for (const [key, value] of entries) {
            await pool.execute(
                'INSERT INTO wp_usermeta (user_id, meta_key, meta_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE meta_value = ?',
                [userId, key, value, value]
            );
        }
        return { success: true };
    } catch (error) {
        console.error('Error updating user metadata:', error);
        throw error;
    }
};

controller.deleteUser = async userId => {
    try {
        // Delete user metadata
        await pool.execute('DELETE FROM wp_usermeta WHERE user_id = ?', [userId]);
        // Delete user
        await pool.execute('DELETE FROM wp_users WHERE ID = ?', [userId]);
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

module.exports = controller;
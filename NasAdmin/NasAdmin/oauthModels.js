﻿/**
 * Constructor.
 */

function InMemoryCache() {
    this.clients = [{ clientId: 'thom', clientSecret: 'nightworld', redirectUris: [''] }];
    this.tokens = [];
    this.users = [{ id: '123', username: 'thomseddon', password: 'nightworld' }];
}

/**
 * Dump the cache.
 */

InMemoryCache.prototype.dump = function () {
    console.log('clients', this.clients);
    console.log('tokens', this.tokens);
    console.log('users', this.users);
};

/*
 * Get access token.
 */

InMemoryCache.getAccessToken = function (bearerToken) {
    var tokens = this.tokens.filter(function (token) {
        return token.accessToken === bearerToken;
    });

    return tokens.length ? tokens[0] : false;
};

/**
 * Get refresh token.
 */

InMemoryCache.getRefreshToken = function (bearerToken) {
    var tokens = this.tokens.filter(function (token) {
        return token.refreshToken === bearerToken;
    });

    return tokens.length ? tokens[0] : false;
};

/**
 * Get client.
 */

InMemoryCache.getClient = function (clientId, clientSecret) {
    var clients = this.clients.filter(function (client) {
        return client.clientId === clientId && client.clientSecret === clientSecret;
    });

    return clients.length ? clients[0] : false;
};

/**
 * Save token.
 */

InMemoryCache.saveToken = function (token, client, user) {
    this.tokens.push({
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        clientId: client.clientId,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        userId: user.id
    });
};

/*
 * Get user.
 */

InMemoryCache.getUser = function (username, password) {
    var users = this.users.filter(function (user) {
        return user.username === username && user.password === password;
    });

    return users.length ? users[0] : false;
};

/*
 * implement saveAuthorizationCode()
 */

InMemoryCache.saveAuthorizationCode = function () { };


/**
 * Export constructor.
 */

module.exports = InMemoryCache;
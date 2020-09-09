import * as ActionTypes from './actionTypes'
import * as AuthSelectors from 'redux/auth/selectors'
import * as RecruitmentSelectors from 'redux/recruitment/selectors'
import { buildFilterArray } from './helpers'

import RecruitmentService from 'services/recruitment'
import UserProfilesService from 'services/userProfiles'
import EventsService from 'services/events'

export const setFilters = data => dispatch => {
    dispatch({
        type: ActionTypes.SET_FILTERS,
        payload: data,
    })
}

export const setFiltersField = (field, value) => dispatch => {
    dispatch({
        type: ActionTypes.SET_FILTERS_FIELD,
        payload: {
            [field]: value,
        },
    })
}

export const setPageSize = size => ({
    type: ActionTypes.SET_PAGE_SIZE,
    payload: size,
})

export const setPage = page => ({
    type: ActionTypes.SET_PAGE,
    payload: page,
})

export const setPrevPage = () => ({
    type: ActionTypes.SET_PREV_PAGE,
})

export const setNextPage = () => ({
    type: ActionTypes.SET_NEXT_PAGE,
})

export const updateEvents = () => (dispatch, getState) => {
    dispatch({
        type: ActionTypes.UPDATE_EVENTS,
        promise: EventsService.getPublicEvents(),
        meta: {
            onFailure: e => console.log('Error updating events', e),
        },
    })
}

export const updateActionHistory = () => (dispatch, getState) => {
    const idToken = AuthSelectors.getIdToken(getState())

    dispatch({
        type: ActionTypes.UPDATE_ACTION_HISTORY,
        promise: RecruitmentService.getActionHistory(idToken),
        meta: {
            onFailure: e => console.log('Error getting action history', e),
        },
    })
}

export const updateSearchResults = () => (dispatch, getState) => {
    const state = getState()
    const idToken = AuthSelectors.getIdToken(state)
    const page = RecruitmentSelectors.page(state)
    const pageSize = RecruitmentSelectors.pageSize(state)
    const filters = buildFilterArray(RecruitmentSelectors.filters(state))

    dispatch({
        type: ActionTypes.UPDATE_SEARCH_RESULTS,
        promise: RecruitmentService.search(idToken, filters, page, pageSize),
        meta: {
            onFailure: e => console.log('Error getting search results', e),
        },
    })
}

export const sendMessage = (message, userId) => async (dispatch, getState) => {
    const idToken = AuthSelectors.getIdToken(getState())

    const res = await dispatch({
        type: ActionTypes.UPDATE_ACTION_HISTORY,
        promise: RecruitmentService.submitAction(
            'message',
            idToken,
            userId,
            message
        ),
        meta: {
            onFailure: e => console.log('Error sending message', e),
        },
    })

    return res
}

export const toggleFavorite = (userId, isFavorite) => async (
    dispatch,
    getState
) => {
    const idToken = AuthSelectors.getIdToken(getState())

    let res

    if (!isFavorite) {
        res = await dispatch({
            type: ActionTypes.UPDATE_ACTION_HISTORY,
            promise: RecruitmentService.submitAction(
                'favorite',
                idToken,
                userId
            ),
            meta: {
                onFailure: e => console.log('Error adding to favorites', e),
            },
        })
    } else {
        res = await dispatch({
            type: ActionTypes.UPDATE_ACTION_HISTORY,
            promise: RecruitmentService.submitAction(
                'remove-favorite',
                idToken,
                userId
            ),
            meta: {
                onFailure: e => console.log('Error adding to favorites', e),
            },
        })
    }

    return res
}

/* Admin actions */
export const updateAdminRecruiters = () => (dispatch, getState) => {
    const idToken = AuthSelectors.getIdToken(getState())

    dispatch({
        type: ActionTypes.ADMIN_UPDATE_RECRUITERS,
        promise: UserProfilesService.getRecruiters(idToken),
        meta: {
            onFailure: e => console.log('Error getting recruiters', e),
        },
    })
}

export const updateAdminSearchResults = query => (dispatch, getState) => {
    const idToken = AuthSelectors.getIdToken(getState())

    dispatch({
        type: ActionTypes.ADMIN_UPDATE_SEARCH_RESULTS,
        promise: UserProfilesService.queryUsers(idToken, query),
        meta: {
            onFailure: e => console.log('Error querying users', e),
        },
    })
}

export const adminGrantRecruiterAccess = (
    userId,
    events,
    organisation
) => async (dispatch, getState) => {
    const idToken = AuthSelectors.getIdToken(getState())

    const user = await UserProfilesService.updateRecruiter(
        idToken,
        userId,
        events,
        organisation
    )
    dispatch({
        type: ActionTypes.ADMIN_UPDATE_USER,
        payload: user,
    })

    dispatch(updateAdminRecruiters())

    return user
}

export const adminRevokeRecruiterAccess = userId => async (
    dispatch,
    getState
) => {
    const idToken = AuthSelectors.getIdToken(getState())

    const user = await UserProfilesService.updateRecruiter(
        idToken,
        userId,
        [],
        ''
    )
    dispatch({
        type: ActionTypes.ADMIN_UPDATE_USER,
        payload: user,
    })
}

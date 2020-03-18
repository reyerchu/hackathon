import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { Typography, Box } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import { push } from 'connected-react-router'

import Image from 'components/generic/Image'
import Button from 'components/generic/Button'
import PageWrapper from 'components/layouts/PageWrapper'
import { useHighlightedEvents } from 'graphql/queries/events'

const useStyles = makeStyles(theme => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        width: '100%',
        padding: theme.spacing(2),
        [theme.breakpoints.up('md')]: {
            flexDirection: 'row',
            alignItems: 'stretch',
            height: '324px',
            padding: 0,
        },
    },
    left: {
        height: '148px',
        position: 'relative',
        padding: theme.spacing(2),
        [theme.breakpoints.up('md')]: {
            flex: 1,
            height: '100%',
        },
    },
    leftImage: {
        background: theme.palette.theme_lightgray.main,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '12px 12px 0 0',
        [theme.breakpoints.up('md')]: {
            borderRadius: '0 12px 12px 0',
        },
    },
    right: {
        background: 'white',
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '0 0 12px 12px',
        [theme.breakpoints.up('md')]: {
            flex: 1,
            background: 'transparent',
            justifyContent: 'center',
            padding: theme.spacing(2, 4),
        },
    },
}))

export default () => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const [events, loading] = useHighlightedEvents({ limit: 1 })
    const event = events?.[0] ?? null
    if (!event) return null
    return (
        <PageWrapper loading={loading}>
            <div className={classes.wrapper}>
                <div className={classes.left}>
                    <Image
                        className={classes.leftImage}
                        publicId={
                            event.coverImage ? event.coverImage.publicId : ''
                        }
                        defaultImage={require('assets/images/default_cover_image.png')}
                    />
                </div>
                <div className={classes.right}>
                    <Typography variant="h6" color="primary">
                        Highlight
                    </Typography>
                    <Typography variant="button">
                        {event?._eventTimeFormatted}
                    </Typography>
                    <Typography variant="h4">{event.name}</Typography>
                    <Typography variant="subtitle1">
                        {event?._eventLocationFormatted}
                    </Typography>
                    <Box
                        mt={2}
                        display="flex"
                        flexDirection="row"
                        flexWrap="wrap"
                    >
                        <Box mr={1} mb={1}>
                            <Button
                                color="theme_lightgray"
                                variant="outlined"
                                onClick={() =>
                                    dispatch(push('/events/' + event.slug))
                                }
                            >
                                See more
                            </Button>
                        </Box>
                        {event.galleryOpen && (
                            <Box mr={1} mb={1}>
                                <Button
                                    color="theme_turquoise"
                                    variant="contained"
                                    onClick={() =>
                                        dispatch(
                                            push('/projects/' + event.slug)
                                        )
                                    }
                                >
                                    View projects
                                </Button>
                            </Box>
                        )}
                    </Box>
                </div>
            </div>
        </PageWrapper>
    )
}

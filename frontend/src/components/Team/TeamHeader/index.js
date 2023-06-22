import { Typography } from '@material-ui/core'
import React from 'react'

export default () => {
    return (
        <div className="tw-flex tw-items-center tw-gap-4">
            <Typography
                className="tw-font-bold tw-tracking-tight"
                variant="h3"
                component="h3"
            >
                Explorers
            </Typography>
            <Typography
                className="tw-tracking-tight tw-font-medium"
                variant="h5"
                color="secondary"
                component="h5"
            >
                #Fazer
            </Typography>
        </div>
    )
}

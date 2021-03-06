import React, { Fragment, useState } from 'react'
import Link from 'react-router-dom/Link'
import Redirect from 'react-router-dom/Redirect'
import { New } from 'croods'

import Form from './Form'

export default props => {
  const [color, setColor] = useState()
  return color ? (
    <Redirect to={`/${color.id}`} />
  ) : (
    <New
      name="colors"
      render={({ create, creating, error }) => (
        <Fragment>
          <h1>New color</h1>
          <Form onSubmit={create} submitting={creating} />
          <Link to="/">Back</Link>
        </Fragment>
      )}
      afterCreate={setColor}
    />
  )
}

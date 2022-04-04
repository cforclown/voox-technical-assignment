import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types'
import BaseTable, { AutoResizer } from 'react-base-table';
import { Card, CardHeader, CardBody } from '../../content/card';
import styled from 'styled-components'
import { toast } from 'react-toastify';
import { ApiRequestException } from '../../../../exceptions/api-request-exceptions';
import { API_REQUEST_EXCEPTION_CODES } from '../../../../exceptions/exceptions-types';
import { getIssues, deleteIssue } from '../../../../resources/issues';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ISSUE_COLUMN from './columns';
import './index.scss';
import 'react-base-table/styles.css'

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`
const TableContainer = styled.div`
  height: calc(100vh - (56px + 36px) - 5.25rem);
`

function Issues({ history }) {
  const [issues, setIssues] = useState({
    data: null,
    sortedData: null,
    sort: {
      key: 'title',
      order: 'asc'
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  // eslint-disable-next-line react/display-name
  ISSUE_COLUMN[3].cellRenderer = ({ rowData }) => (
    <>
      <button 
        type="button" 
        className="btn btn-warning"
        style={{marginRight: "8px"}} 
        onClick={() => history.push("/issues/create-edit-issue", { 
          state: { issue: rowData }
        })}
      >
        <FontAwesomeIcon size="sm" icon={["fas", "pencil-alt"]} />
      </button>
      <button
        type="button" 
        className="btn btn-danger"  onClick={() => onDelete(rowData.id)}
      >
        <FontAwesomeIcon size="sm" icon={["fas", "trash"]} />
      </button>
    </>
  )

  useEffect(async ()=>{
    getData();
  }, []);

  async function getData() {
    try {
      setIsLoading(true);
      const data = (await getIssues()).map(issue => {
        return {
          ...issue,
          id: issue._id
        }
      });
      setIssues({
        ...issues,
        data,
        sortedData: sortData(issues.sort, data)
      });
      setIsLoading(false);
    } catch(err) {
      setIsLoading(false);

      if(err instanceof ApiRequestException) {
        if(err.code === API_REQUEST_EXCEPTION_CODES.unauthorized){
          return history.push('/login', {
            state: { redirectPath: '/issues' },
          });
        }
      }

      toast.error(err.message);
    }
  }
  async function onDelete(issueId) {
    try {
      setIsLoading(true);
      await deleteIssue(issueId);
      getData();
    } catch(err) {
      setIsLoading(false);
      toast.error(err.message);
      if(err instanceof ApiRequestException) {
        if(err.code === API_REQUEST_EXCEPTION_CODES.unauthorized){
          history.push('/login', {
            state: { redirectPath: '/issues' },
          });
        }
      }
    }
  }

  function sortData(sort, data) {
    return data.sort((x, y) => {
      const keyX = x[sort.key].toString().toUpperCase();
      const keyY = y[sort.key].toString().toUpperCase();

      if (sort.order === "asc") {
        if (keyX > keyY) return 1;
        else if (keyX < keyY) return -1;
      } else {
        if (keyX > keyY) return -1;
        else if (keyX < keyY) return 1;
      }

      return 0;
    });
  }

  function onSort(sort) {
    console.log(sort)
    const sortedData = sortData(sort, issues.data)

    setIssues({
      ...issues,
      sortedData,
      sort
    });
  }

  return (
    <Card>
      <CardHeader>
        <HeaderContainer>
          <h6>ISSUES</h6>
          <button type="button" className="btn btn-primary" onClick={() => history.push('/issues/create-edit-issue')}>
            <FontAwesomeIcon icon={['fas', 'plus']} />
          </button>
        </HeaderContainer>
      </CardHeader>
      <CardBody>
        <TableContainer>
        {
          issues.data && issues.data.length ?
          <AutoResizer>
            {({ width, height }) => {
              return (
                <BaseTable
                  key={0}
                  fixed
                  width={width}
                  height={height}
                  columns={ISSUE_COLUMN}
                  data={issues.sortedData}
                  disabled={isLoading}
                  sortBy={issues.sort}
                  onColumnSort={onSort}
                />
              );
            }}
          </AutoResizer> :
          <label style={{color: 'red'}}>No issues</label>
        }
        </TableContainer>
      </CardBody>
    </Card>
  );
}

Issues.propTypes = {
  history: PropTypes.any
}

export default Issues;

import React from 'react';
import { fromEvent, from } from 'rxjs';
import { map, mergeMap, switchMap, debounceTime, 
    filter, distinctUntilChanged, tap, catchError, retry, finalize,
} from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styled from 'styled-components';

const AutoComplete = styled.div`
    position: relative;
    width: 300px;
`;

const Search = styled.input`
    width: 100%;
`;
const SuggestLayer = styled.ul`
    position: absolute;
    top: 20px;
    color: #666;
    padding: 0px;
    margin: 0px;
    width: 100%;
`;
const SuggestLayerList = styled.li`
    border: 1px solid #bec8d8;
    list-style: none;
`;

const UserImg = styled.img`
    position: relative;
    float: left;
    margin-right: 10px;
`
const UserText = styled.p`
    line-height: 50px;
    margin: 0px;
    padding: 0px;
`;
const Loading = styled.div`
    position: absolute;
    z-index: 2;
    top: 2px;
    right: 0px;
    display: none;
`;

const RxJsStudy = () => {
    const [items, setItems] = React.useState([]);
    const loading = React.useRef();

    React.useEffect(() => {
        const keyup$ = fromEvent(document.getElementById('search'), 'keyup')
                .pipe(
                    debounceTime(300),
                    map(event => event.target.value),
                    distinctUntilChanged(),    
                );

        const user$ = keyup$
                .pipe(
                    filter(query => query.trim().length > 0),
                    tap(showLoading),
                    switchMap(query => ajax.getJSON(`https://api.github.com/search/users?q=${query}`)),
                    tap(hideLoading),
                    retry(2),
                    finalize(hideLoading)
                );

        const reset$ = keyup$
                .pipe(
                    filter(query => query.trim().length === 0),
                    tap(value => setItems([]))
                );

        user$.subscribe({
            next: value => {
                console.log('서버로부터 받은 검색 결과', value);
                setItems(value.items);
            },
            error: e => {
                console.error(3);
                alert(e.message);
            }
        });
        reset$.subscribe();
    
    }, []);

    const showLoading = () => {
        loading.current.style.display = 'block';
    };

    const hideLoading = () => {
        loading.current.style.display = 'none';
    };
    return (
        <AutoComplete>
            <Search id='search' type='input' placeholder='검색하고 싶은 사용자 아이디를 입력해주세요'></Search>
            <SuggestLayer>
                { items.map((item, idx) => (
                    <SuggestLayerList key={idx}>
                        <UserImg src={item.avatar_url} width='50px' height='50px' />
                        <UserText>
                            <a href={item.html_url} target='_blank' rel="noopener noreferrer">{item.login}</a>
                        </UserText>
                    </SuggestLayerList>
                ))
                }
            </SuggestLayer>
            <Loading ref={loading}>
                <FontAwesomeIcon icon={faSpinner} />
            </Loading>
        </AutoComplete>
    );
};

export default RxJsStudy;
